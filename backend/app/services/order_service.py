from sqlalchemy.orm import Session
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderUpdate
from typing import Optional, List


class OrderService:
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
        # Calculate total
        total = 0
        items_to_create = []
        
        for item_data in order.items:
            product = db.query(Product).filter(
                Product.id == item_data["product"]["id"]
            ).first()
            
            if not product:
                raise ValueError(f"Product {item_data['product']['id']} not found")
            
            if product.stock < item_data["quantity"]:
                raise ValueError(f"Insufficient stock for {product.name}")
            
            item_total = product.price * item_data["quantity"]
            total += item_total
            
            items_to_create.append({
                "product_id": product.id,
                "quantity": item_data["quantity"],
                "price": product.price
            })
            
            # Update stock
            product.stock -= item_data["quantity"]
        
        # Create order
        db_order = Order(
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
        
        # Create order items
        for item_data in items_to_create:
            db_item = OrderItem(
                order_id=db_order.id,
                **item_data
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
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
