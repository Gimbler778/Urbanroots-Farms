from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas import Order, OrderCreate, OrderUpdate
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=List[Order])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all orders"""
    orders = OrderService.get_orders(db, skip=skip, limit=limit)
    return orders


@router.get("/{order_id}", response_model=Order)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = OrderService.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=Order, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    try:
        return OrderService.create_order(db, order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}", response_model=Order)
def update_order(
    order_id: str,
    order: OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update an order status"""
    updated_order = OrderService.update_order(db, order_id, order)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated_order
