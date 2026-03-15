from sqlalchemy.orm import Session
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderUpdate
from typing import Optional, List


class OrderService:
    @staticmethod
    def _create_order_internal(db: Session, order: OrderCreate, user_id: Optional[str]) -> Order:
        total = 0
        items_to_create = []

        try:
            for item_data in order.items:
                product_payload = item_data.get("product", {})
                product_id = product_payload.get("id")
                quantity = item_data.get("quantity", 0)

                if not product_id:
                    raise ValueError("Product id is required for each order item")
                if quantity <= 0:
                    raise ValueError("Quantity must be greater than zero")

                product = db.query(Product).filter(Product.id == product_id).with_for_update().first()

                if not product:
                    raise ValueError(f"Product {product_id} not found")

                if product.stock < quantity:
                    raise ValueError(f"Insufficient stock for {product.name}")

                item_total = product.price * quantity
                total += item_total

                items_to_create.append({
                    "product_id": product.id,
                    "quantity": quantity,
                    "price": product.price
                })

                product.stock -= quantity

            db_order = Order(
                user_id=user_id,
                total=total,
                full_name=order.shipping_address.full_name,
                street=order.shipping_address.street,
                city=order.shipping_address.city,
                state=order.shipping_address.state,
                zip_code=order.shipping_address.zip_code,
                country=order.shipping_address.country,
                phone=order.shipping_address.phone
            )
            db.add(db_order)
            db.flush()

            for item_data in items_to_create:
                db_item = OrderItem(
                    order_id=db_order.id,
                    **item_data
                )
                db.add(db_item)

            db.commit()
            db.refresh(db_order)
            return db_order
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_order(db: Session, order_id: str) -> Optional[Order]:
        return db.query(Order).filter(Order.id == order_id).first()
    
    @staticmethod
    def get_orders(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Order]:
        return db.query(Order).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_order(db: Session, order: OrderCreate) -> Order:
        return OrderService._create_order_internal(db, order, user_id=None)
    
    @staticmethod
    def update_order(
        db: Session,
        order_id: str,
        order: OrderUpdate
    ) -> Optional[Order]:
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if db_order:
            update_data = order.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_order, field, value)
            db.commit()
            db.refresh(db_order)
        return db_order

    @staticmethod
    def create_order_for_user(db: Session, order: OrderCreate, user_id: Optional[str]) -> Order:
        return OrderService._create_order_internal(db, order, user_id=user_id)
