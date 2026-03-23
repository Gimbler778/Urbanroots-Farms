import uuid
from datetime import datetime, timezone
from typing import Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models import ProductReview as ProductReviewModel, ProductReviewVote, Session as AuthSession, User
from app.schemas import ProductReview, ProductReviewCreate, ProductReviewListResponse, ProductReviewReplyCreate, ProductReviewVoteUpdate

router = APIRouter(prefix="/products", tags=["product-reviews"])

MAX_THREAD_DEPTH = 20


def _sanitize_body(body: str) -> str:
    value = body.strip()
    if not value:
        raise HTTPException(status_code=400, detail="Review text cannot be empty")
    return value


def _serialize_review(review: ProductReviewModel, user_vote: int = 0) -> Dict[str, object]:
    return {
        "id": review.id,
        "product_id": review.product_id,
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


def _collect_tree_in_order(roots: List[ProductReviewModel], all_reviews: List[ProductReviewModel]) -> List[ProductReviewModel]:
    by_parent: Dict[Optional[str], List[ProductReviewModel]] = {}
    for review in all_reviews:
        by_parent.setdefault(review.parent_id, []).append(review)

    for siblings in by_parent.values():
        siblings.sort(key=lambda review: review.created_at)

    ordered: List[ProductReviewModel] = []

    def walk(node: ProductReviewModel) -> None:
        ordered.append(node)
        for child in by_parent.get(node.id, []):
            walk(child)

    for root in roots:
        walk(root)

    return ordered


@router.get("/{product_id}/reviews", response_model=ProductReviewListResponse)
def list_product_reviews(
    product_id: str,
    request: Request,
    page: int = 1,
    page_size: int = 10,
    sort: Literal["newest", "oldest", "top"] = "newest",
    db: Session = Depends(get_db),
):
    page = max(1, page)
    page_size = max(1, min(page_size, 25))

    total_top_level = (
        db.query(func.count(ProductReviewModel.id))
        .filter(ProductReviewModel.product_id == product_id, ProductReviewModel.parent_id.is_(None))
        .scalar()
    ) or 0

    if sort == "top":
        order_clause = (desc(ProductReviewModel.upvotes), desc(ProductReviewModel.created_at))
    elif sort == "oldest":
        order_clause = asc(ProductReviewModel.created_at)
    else:
        order_clause = desc(ProductReviewModel.created_at)

    roots_query = (
        db.query(ProductReviewModel)
        .filter(ProductReviewModel.product_id == product_id, ProductReviewModel.parent_id.is_(None))
    )

    if isinstance(order_clause, tuple):
        for clause in order_clause:
            roots_query = roots_query.order_by(clause)
    else:
        roots_query = roots_query.order_by(order_clause)

    roots = roots_query.offset((page - 1) * page_size).limit(page_size).all()

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
        thread_conditions.append(ProductReviewModel.path == root.id)
        thread_conditions.append(ProductReviewModel.path.like(f"{root.id}/%"))

    all_reviews = (
        db.query(ProductReviewModel)
        .filter(ProductReviewModel.product_id == product_id, or_(*thread_conditions))
        .all()
    )

    ordered_reviews = _collect_tree_in_order(roots, all_reviews)

    current_user = _get_optional_user(request, db)
    user_votes: Dict[str, int] = {}
    if current_user and ordered_reviews:
        review_ids = [review.id for review in ordered_reviews]
        vote_rows = (
            db.query(ProductReviewVote)
            .filter(ProductReviewVote.user_id == current_user.id, ProductReviewVote.review_id.in_(review_ids))
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


@router.post("/{product_id}/reviews", response_model=ProductReview, status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: str,
    payload: ProductReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review_id = str(uuid.uuid4())
    review = ProductReviewModel(
        id=review_id,
        product_id=product_id,
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


@router.post("/{product_id}/reviews/{review_id}/replies", response_model=ProductReview, status_code=status.HTTP_201_CREATED)
def create_product_review_reply(
    product_id: str,
    review_id: str,
    payload: ProductReviewReplyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    parent = (
        db.query(ProductReviewModel)
        .filter(ProductReviewModel.id == review_id, ProductReviewModel.product_id == product_id)
        .first()
    )
    if not parent:
        raise HTTPException(status_code=404, detail="Parent review not found")

    if parent.depth >= MAX_THREAD_DEPTH:
        raise HTTPException(status_code=400, detail="Maximum reply depth reached")

    reply_id = str(uuid.uuid4())
    reply = ProductReviewModel(
        id=reply_id,
        product_id=product_id,
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


@router.post("/{product_id}/reviews/{review_id}/vote", response_model=ProductReview)
def vote_on_product_review(
    product_id: str,
    review_id: str,
    payload: ProductReviewVoteUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = (
        db.query(ProductReviewModel)
        .filter(ProductReviewModel.id == review_id, ProductReviewModel.product_id == product_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    existing_vote = (
        db.query(ProductReviewVote)
        .filter(ProductReviewVote.review_id == review.id, ProductReviewVote.user_id == user.id)
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
        db.add(ProductReviewVote(review_id=review.id, user_id=user.id, value=payload.value))

    review.upvotes = int(review.upvotes or 0) + delta

    db.commit()
    db.refresh(review)
    return _serialize_review(review, payload.value)


@router.delete("/{product_id}/reviews/{review_id}", status_code=status.HTTP_200_OK)
def delete_product_review(
    product_id: str,
    review_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = (
        db.query(ProductReviewModel)
        .filter(ProductReviewModel.id == review_id, ProductReviewModel.product_id == product_id)
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
