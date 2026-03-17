import uuid
from datetime import datetime, timezone
from typing import Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models import PodReview as PodReviewModel, PodReviewVote, Session as AuthSession, User
from app.schemas import PodReview, PodReviewCreate, PodReviewListResponse, PodReviewReplyCreate, PodReviewVoteUpdate
from app.services.pod_rental_service import PodRentalService

router = APIRouter(prefix="/pods", tags=["pod-reviews"])

MAX_THREAD_DEPTH = 8


def _ensure_valid_pod_plan(pod_plan_id: str) -> None:
    if not PodRentalService.get_plan(pod_plan_id):
        raise HTTPException(status_code=404, detail="Pod plan not found")


def _sanitize_body(body: str) -> str:
    value = body.strip()
    if not value:
        raise HTTPException(status_code=400, detail="Review text cannot be empty")
    return value


def _serialize_review(review: PodReviewModel, user_vote: int = 0) -> Dict[str, object]:
    return {
        "id": review.id,
        "pod_plan_id": review.pod_plan_id,
        "parent_id": review.parent_id,
        "user_id": review.user_id,
        "author_name": review.author_name,
        "body": review.body,
        "rating": review.rating,
        "depth": review.depth,
        "path": review.path,
        "upvotes": review.upvotes,
        "score": review.score,
        "is_deleted": review.is_deleted,
        "user_vote": user_vote,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
    }


def _get_optional_user(request: Request, db: Session) -> Optional[User]:
    session_token = request.cookies.get("better-auth.session_token")
    if not session_token:
        return None

    session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
    if not session or session.expiresAt < datetime.now(timezone.utc):
        return None

    return db.query(User).filter(User.id == session.userId).first()


def _collect_tree_in_order(roots: List[PodReviewModel], all_reviews: List[PodReviewModel]) -> List[PodReviewModel]:
    by_parent: Dict[Optional[str], List[PodReviewModel]] = {}
    for review in all_reviews:
        by_parent.setdefault(review.parent_id, []).append(review)

    for siblings in by_parent.values():
        siblings.sort(key=lambda review: review.created_at)

    ordered: List[PodReviewModel] = []

    def walk(node: PodReviewModel) -> None:
        ordered.append(node)
        for child in by_parent.get(node.id, []):
            walk(child)

    for root in roots:
        walk(root)

    return ordered


@router.get("/{pod_plan_id}/reviews", response_model=PodReviewListResponse)
def list_pod_reviews(
    pod_plan_id: str,
    request: Request,
    page: int = 1,
    page_size: int = 10,
    sort: Literal["newest", "oldest"] = "newest",
    db: Session = Depends(get_db),
):
    _ensure_valid_pod_plan(pod_plan_id)

    page = max(1, page)
    page_size = max(1, min(page_size, 25))

    total_top_level = (
        db.query(func.count(PodReviewModel.id))
        .filter(PodReviewModel.pod_plan_id == pod_plan_id, PodReviewModel.parent_id.is_(None))
        .scalar()
    ) or 0

    order_clause = desc(PodReviewModel.created_at) if sort == "newest" else asc(PodReviewModel.created_at)

    roots = (
        db.query(PodReviewModel)
        .filter(PodReviewModel.pod_plan_id == pod_plan_id, PodReviewModel.parent_id.is_(None))
        .order_by(order_clause)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    if not roots:
        return {
            "reviews": [],
            "page": page,
            "page_size": page_size,
            "total_top_level": total_top_level,
            "has_next": (page * page_size) < total_top_level,
            "sort": sort,
        }

    thread_conditions = []
    for root in roots:
        thread_conditions.append(PodReviewModel.path == root.id)
        thread_conditions.append(PodReviewModel.path.like(f"{root.id}/%"))

    all_reviews = (
        db.query(PodReviewModel)
        .filter(PodReviewModel.pod_plan_id == pod_plan_id, or_(*thread_conditions))
        .all()
    )

    ordered_reviews = _collect_tree_in_order(roots, all_reviews)

    current_user = _get_optional_user(request, db)
    user_votes: Dict[str, int] = {}
    if current_user and ordered_reviews:
        review_ids = [review.id for review in ordered_reviews]
        vote_rows = (
            db.query(PodReviewVote)
            .filter(PodReviewVote.user_id == current_user.id, PodReviewVote.review_id.in_(review_ids))
            .all()
        )
        user_votes = {vote.review_id: int(vote.value) for vote in vote_rows}

    serialized_reviews = [_serialize_review(review, user_votes.get(review.id, 0)) for review in ordered_reviews]

    return {
        "reviews": serialized_reviews,
        "page": page,
        "page_size": page_size,
        "total_top_level": total_top_level,
        "has_next": (page * page_size) < total_top_level,
        "sort": sort,
    }


@router.post("/{pod_plan_id}/reviews", response_model=PodReview, status_code=status.HTTP_201_CREATED)
def create_pod_review(
    pod_plan_id: str,
    payload: PodReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_valid_pod_plan(pod_plan_id)

    review_id = str(uuid.uuid4())
    review = PodReviewModel(
        id=review_id,
        pod_plan_id=pod_plan_id,
        parent_id=None,
        user_id=user.id,
        author_name=user.name,
        body=_sanitize_body(payload.body),
        rating=payload.rating,
        depth=0,
        path=review_id,
    )

    db.add(review)
    db.commit()
    db.refresh(review)
    return _serialize_review(review, 0)


@router.post("/{pod_plan_id}/reviews/{review_id}/replies", response_model=PodReview, status_code=status.HTTP_201_CREATED)
def create_pod_review_reply(
    pod_plan_id: str,
    review_id: str,
    payload: PodReviewReplyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_valid_pod_plan(pod_plan_id)

    parent = (
        db.query(PodReviewModel)
        .filter(PodReviewModel.id == review_id, PodReviewModel.pod_plan_id == pod_plan_id)
        .first()
    )
    if not parent:
        raise HTTPException(status_code=404, detail="Parent review not found")

    if parent.depth >= MAX_THREAD_DEPTH:
        raise HTTPException(status_code=400, detail="Maximum reply depth reached")

    reply_id = str(uuid.uuid4())
    reply = PodReviewModel(
        id=reply_id,
        pod_plan_id=pod_plan_id,
        parent_id=parent.id,
        user_id=user.id,
        author_name=user.name,
        body=_sanitize_body(payload.body),
        rating=None,
        depth=parent.depth + 1,
        path=f"{parent.path}/{reply_id}",
    )

    db.add(reply)
    db.commit()
    db.refresh(reply)
    return _serialize_review(reply, 0)


@router.post("/{pod_plan_id}/reviews/{review_id}/vote", response_model=PodReview)
def vote_on_pod_review(
    pod_plan_id: str,
    review_id: str,
    payload: PodReviewVoteUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_valid_pod_plan(pod_plan_id)

    review = (
        db.query(PodReviewModel)
        .filter(PodReviewModel.id == review_id, PodReviewModel.pod_plan_id == pod_plan_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    existing_vote = (
        db.query(PodReviewVote)
        .filter(PodReviewVote.review_id == review.id, PodReviewVote.user_id == user.id)
        .first()
    )

    delta = 0
    if payload.value == 0:
        if existing_vote:
            delta = -int(existing_vote.value)
            db.delete(existing_vote)
    elif existing_vote:
        delta = payload.value - int(existing_vote.value)
        existing_vote.value = payload.value
    else:
        delta = payload.value
        db.add(PodReviewVote(review_id=review.id, user_id=user.id, value=payload.value))

    review.upvotes = int(review.upvotes or 0) + delta

    db.commit()
    db.refresh(review)
    return _serialize_review(review, payload.value)


@router.delete("/{pod_plan_id}/reviews/{review_id}", status_code=status.HTTP_200_OK)
def delete_pod_review(
    pod_plan_id: str,
    review_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_valid_pod_plan(pod_plan_id)

    review = (
        db.query(PodReviewModel)
        .filter(PodReviewModel.id == review_id, PodReviewModel.pod_plan_id == pod_plan_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    if not review.is_deleted:
        review.is_deleted = True
        review.body = "[deleted]"
        review.rating = None
        db.commit()

    return {"success": True, "message": "Review deleted"}
