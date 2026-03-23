from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models import User, UserCartItem as UserCartItemModel
from app.schemas import UserCartItem, UserCartItemPayload, UserCartItemUpdate

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=list[UserCartItem])
def get_user_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(UserCartItemModel)
        .filter(UserCartItemModel.user_id == user.id)
        .order_by(UserCartItemModel.created_at.asc())
        .all()
    )


@router.put("/items/{product_id}", response_model=UserCartItem)
def upsert_cart_item(
    product_id: str,
    payload: UserCartItemPayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.product_id != product_id:
        raise HTTPException(status_code=400, detail="Product id mismatch")

    item = (
        db.query(UserCartItemModel)
        .filter(UserCartItemModel.user_id == user.id, UserCartItemModel.product_id == product_id)
        .first()
    )

    if item:
        item.name = payload.name
        item.category = payload.category
        item.price = payload.price
        item.description = payload.description
        item.image = payload.image
        item.quantity = payload.quantity
    else:
        item = UserCartItemModel(
            user_id=user.id,
            product_id=payload.product_id,
            name=payload.name,
            category=payload.category,
            price=payload.price,
            description=payload.description,
            image=payload.image,
            quantity=payload.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(item)
    return item


@router.patch("/items/{product_id}", response_model=UserCartItem)
def update_cart_item_quantity(
    product_id: str,
    payload: UserCartItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = (
        db.query(UserCartItemModel)
        .filter(UserCartItemModel.user_id == user.id, UserCartItemModel.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{product_id}", status_code=status.HTTP_200_OK)
def remove_cart_item(
    product_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = (
        db.query(UserCartItemModel)
        .filter(UserCartItemModel.user_id == user.id, UserCartItemModel.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"success": True}


@router.delete("/", status_code=status.HTTP_200_OK)
def clear_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    (
        db.query(UserCartItemModel)
        .filter(UserCartItemModel.user_id == user.id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"success": True}
