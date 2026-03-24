import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    Order,
    OrderItem,
    Product,
    ProductOrderBatch,
    ProductOrderBatchItem,
    ProductOrderBatchStatus,
    ProductOrderBatchItemStatus,
    UserCartItem,
)
from app.schemas import OrderCreate, OrderUpdate
from typing import Optional, List


class OrderService:
    TAX_RATE = 0.08

    @staticmethod
    def _generate_batch_ref() -> str:
        return f"URB-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    @staticmethod
    def _recalculate_batch_totals(batch: ProductOrderBatch) -> None:
        active_items = [item for item in batch.items if item.status != ProductOrderBatchItemStatus.CANCELLED]
        subtotal = sum(item.line_total for item in active_items)
        tax = round(subtotal * OrderService.TAX_RATE, 2)
        total = round(subtotal + tax, 2)

        batch.subtotal = subtotal
        batch.tax = tax
        batch.total = total
        batch.status = ProductOrderBatchStatus.CANCELLED if not active_items else ProductOrderBatchStatus.REQUESTED

    @staticmethod
    def create_batch_from_user_cart(db: Session, user_id: str, customer_name: str, customer_email: str) -> ProductOrderBatch:
        cart_items = (
            db.query(UserCartItem)
            .filter(UserCartItem.user_id == user_id)
            .order_by(UserCartItem.created_at.asc())
            .all()
        )

        if not cart_items:
            raise ValueError("Your cart is empty. Add products before checkout.")

        subtotal = 0.0
        batch_items_payload: list[dict] = []

        try:
            for cart_item in cart_items:
                product = db.query(Product).filter(Product.id == cart_item.product_id).with_for_update().first()
                if not product:
                    # Frontend catalog may use local IDs that are not seeded in backend.
                    # Persist a matching product row on-demand so checkout can proceed.
                    product = Product(
                        id=cart_item.product_id,
                        name=cart_item.name,
                        description=cart_item.description,
                        price=cart_item.price,
                        image=cart_item.image,
                        category=cart_item.category,
                        stock=max(cart_item.quantity, 1000),
                        organic=True,
                        unit="unit",
                    )
                    db.add(product)
                    db.flush()

                if product.stock < cart_item.quantity:
                    raise ValueError(f"Insufficient stock for {product.name}")

                line_total = round(cart_item.price * cart_item.quantity, 2)
                subtotal += line_total

                batch_items_payload.append({
                    "product_id": product.id,
                    "name": cart_item.name or product.name,
                    "image": cart_item.image or product.image,
                    "category": cart_item.category or product.category,
                    "quantity": cart_item.quantity,
                    "unit_price": cart_item.price,
                    "line_total": round(cart_item.price * cart_item.quantity, 2),
                })

                product.stock -= cart_item.quantity

            if not batch_items_payload:
                raise ValueError("Your cart is empty. Add products before checkout.")

            subtotal = round(subtotal, 2)
            tax = round(subtotal * OrderService.TAX_RATE, 2)
            total = round(subtotal + tax, 2)

            batch = ProductOrderBatch(
                batch_ref=OrderService._generate_batch_ref(),
                user_id=user_id,
                customer_name=customer_name,
                customer_email=customer_email,
                status=ProductOrderBatchStatus.REQUESTED,
                subtotal=subtotal,
                tax=tax,
                total=total,
            )
            db.add(batch)
            db.flush()

            for item_payload in batch_items_payload:
                db.add(
                    ProductOrderBatchItem(
                        batch_id=batch.id,
                        status=ProductOrderBatchItemStatus.REQUESTED,
                        **item_payload,
                    )
                )

            (
                db.query(UserCartItem)
                .filter(UserCartItem.user_id == user_id)
                .delete(synchronize_session=False)
            )

            db.commit()
            db.refresh(batch)
            return batch
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_user_batches(db: Session, user_id: str) -> list[ProductOrderBatch]:
        return (
            db.query(ProductOrderBatch)
            .filter(ProductOrderBatch.user_id == user_id)
            .order_by(ProductOrderBatch.created_at.desc())
            .all()
        )

    @staticmethod
    def get_user_batch(db: Session, user_id: str, batch_id: str) -> Optional[ProductOrderBatch]:
        return (
            db.query(ProductOrderBatch)
            .filter(ProductOrderBatch.id == batch_id, ProductOrderBatch.user_id == user_id)
            .first()
        )

    @staticmethod
    def cancel_batch(db: Session, user_id: str, batch_id: str) -> ProductOrderBatch:
        batch = OrderService.get_user_batch(db, user_id, batch_id)
        if not batch:
            raise ValueError("Order batch not found")

        if batch.status == ProductOrderBatchStatus.COMPLETED:
            raise ValueError("Completed batches cannot be cancelled")

        if batch.status == ProductOrderBatchStatus.CANCELLED:
            return batch

        try:
            for item in batch.items:
                if item.status == ProductOrderBatchItemStatus.CANCELLED:
                    continue

                product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if product:
                    product.stock += item.quantity

                item.status = ProductOrderBatchItemStatus.CANCELLED

            OrderService._recalculate_batch_totals(batch)

            db.commit()
            db.refresh(batch)
            return batch
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def cancel_batch_item(db: Session, user_id: str, batch_id: str, item_id: str) -> ProductOrderBatch:
        batch = OrderService.get_user_batch(db, user_id, batch_id)
        if not batch:
            raise ValueError("Order batch not found")

        if batch.status == ProductOrderBatchStatus.COMPLETED:
            raise ValueError("Completed batches cannot be modified")

        item = next((entry for entry in batch.items if entry.id == item_id), None)
        if not item:
            raise ValueError("Batch item not found")

        if item.status == ProductOrderBatchItemStatus.CANCELLED:
            return batch

        try:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product:
                product.stock += item.quantity

            item.status = ProductOrderBatchItemStatus.CANCELLED
            OrderService._recalculate_batch_totals(batch)

            db.commit()
            db.refresh(batch)
            return batch
        except Exception:
            db.rollback()
            raise

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
