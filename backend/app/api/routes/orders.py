from datetime import datetime, timezone
from html import escape
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models import User, Session as AuthSession
from app.schemas import Order, OrderCreate, OrderUpdate, ProductOrderBatchActionResponse, ProductOrderBatchSummary
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


def serialize_batch(batch) -> ProductOrderBatchSummary:
    active_quantity = sum(item.quantity for item in batch.items if str(item.status.value if hasattr(item.status, "value") else item.status) != "cancelled")
    return ProductOrderBatchSummary(
        id=batch.id,
        batch_ref=batch.batch_ref,
        user_id=batch.user_id,
        customer_name=batch.customer_name,
        customer_email=batch.customer_email,
        status=batch.status,
        subtotal=batch.subtotal,
        tax=batch.tax,
        total=batch.total,
        item_count=active_quantity,
        created_at=batch.created_at,
        updated_at=batch.updated_at,
        items=batch.items,
    )


def _format_status_label(value: str) -> str:
        return value.replace("_", " ").title()


def build_admin_batch_email(batch) -> str:
        customer_name = escape(batch.customer_name)
        customer_email = escape(batch.customer_email)
        batch_ref = escape(batch.batch_ref)
        status = _format_status_label(str(batch.status.value if hasattr(batch.status, "value") else batch.status))

        rows = "".join(
                f"""
                <tr>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;">{escape(item.name)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:center;">{item.quantity}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">Rs. {item.unit_price:,.2f}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">Rs. {item.line_total:,.2f}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">{_format_status_label(str(item.status.value if hasattr(item.status, 'value') else item.status))}</td>
                </tr>
                """
                for item in batch.items
        )

        return f"""
            <div style="font-family:'Segoe UI',sans-serif;background:#f6f4ee;padding:24px;color:#29402b;">
                <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd1;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(39,60,35,0.12);">
                    <div style="padding:20px 24px;background:linear-gradient(135deg,#4d8d43,#7abd68);color:#ffffff;">
                        <div style="font-size:22px;font-weight:700;">UrbanRoots • New Product Batch Order</div>
                        <div style="margin-top:6px;opacity:0.92;">Batch {batch_ref}</div>
                    </div>
                    <div style="padding:24px;line-height:1.65;">
                        <p style="margin-top:0;">A new product checkout batch has been placed.</p>
                        <ul style="margin:10px 0 0 18px;padding:0;">
                            <li>Customer: {customer_name}</li>
                            <li>Email: {customer_email}</li>
                            <li>Status: {status}</li>
                            <li>Subtotal: Rs. {batch.subtotal:,.2f}</li>
                            <li>Tax: Rs. {batch.tax:,.2f}</li>
                            <li>Total: Rs. {batch.total:,.2f}</li>
                        </ul>
                        <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px;">
                            <thead style="background:#f0f7ec;">
                                <tr>
                                    <th style="padding:8px 10px;text-align:left;">Product</th>
                                    <th style="padding:8px 10px;text-align:center;">Qty</th>
                                    <th style="padding:8px 10px;text-align:right;">Unit</th>
                                    <th style="padding:8px 10px;text-align:right;">Line Total</th>
                                    <th style="padding:8px 10px;text-align:right;">Item Status</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        """


def build_customer_batch_email(batch) -> str:
        customer_name = escape(batch.customer_name)
        batch_ref = escape(batch.batch_ref)
        status = _format_status_label(str(batch.status.value if hasattr(batch.status, "value") else batch.status))

        rows = "".join(
                f"""
                <tr>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;">{escape(item.name)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:center;">{item.quantity}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">Rs. {item.unit_price:,.2f}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">Rs. {item.line_total:,.2f}</td>
                </tr>
                """
                for item in batch.items
        )

        return f"""
            <div style="font-family:'Segoe UI',sans-serif;background:#f6f4ee;padding:24px;color:#29402b;">
                <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd1;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(39,60,35,0.12);">
                    <div style="padding:20px 24px;background:linear-gradient(135deg,#4d8d43,#7abd68);color:#ffffff;">
                        <div style="font-size:22px;font-weight:700;">UrbanRoots • Order Confirmation</div>
                        <div style="margin-top:6px;opacity:0.92;">Batch {batch_ref} received</div>
                    </div>
                    <div style="padding:24px;line-height:1.65;">
                        <p style="margin-top:0;">Hi {customer_name}, thank you for your purchase. Your product order batch has been saved successfully.</p>
                        <ul style="margin:10px 0 0 18px;padding:0;">
                            <li>Batch reference: {batch_ref}</li>
                            <li>Status: {status}</li>
                            <li>Subtotal: Rs. {batch.subtotal:,.2f}</li>
                            <li>Tax: Rs. {batch.tax:,.2f}</li>
                            <li>Total: Rs. {batch.total:,.2f}</li>
                        </ul>
                        <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px;">
                            <thead style="background:#f0f7ec;">
                                <tr>
                                    <th style="padding:8px 10px;text-align:left;">Product</th>
                                    <th style="padding:8px 10px;text-align:center;">Qty</th>
                                    <th style="padding:8px 10px;text-align:right;">Unit</th>
                                    <th style="padding:8px 10px;text-align:right;">Line Total</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </table>
                        <p style="margin-top:16px;font-size:13px;color:#617060;">You can track this batch from My Orders in your UrbanRoots account.</p>
                    </div>
                </div>
            </div>
        """


async def send_batch_checkout_emails(batch) -> None:
        fm = FastMail(conf)
        admin_message = MessageSchema(
                subject=f"New Product Batch Order • {batch.batch_ref}",
                recipients=[settings.admin_email],
                body=build_admin_batch_email(batch),
                subtype=MessageType.html,
                reply_to=[batch.customer_email],
        )
        customer_message = MessageSchema(
                subject=f"Your UrbanRoots order summary • {batch.batch_ref}",
                recipients=[batch.customer_email],
                body=build_customer_batch_email(batch),
                subtype=MessageType.html,
                reply_to=[settings.admin_email],
        )

        await fm.send_message(admin_message)
        await fm.send_message(customer_message)


def get_optional_current_user(request: Request, db: Session) -> User | None:
    session_token = request.cookies.get("better-auth.session_token")
    if not session_token:
        return None

    session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
    if not session or session.expiresAt < datetime.now(timezone.utc):
        return None

    return db.query(User).filter(User.id == session.userId).first()


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
def create_order(order: OrderCreate, request: Request, db: Session = Depends(get_db)):
    """Create a new order"""
    try:
        user = get_optional_current_user(request, db)
        return OrderService.create_order_for_user(db, order, user.id if user else None)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batches/checkout", response_model=ProductOrderBatchActionResponse, status_code=201)
async def checkout_user_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        batch = OrderService.create_batch_from_user_cart(db, user.id, user.name, user.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    message = "Order batch created successfully. Summary emails sent to admin and customer."
    try:
        await send_batch_checkout_emails(batch)
    except Exception:
        message = "Order batch created successfully. Email delivery could not be confirmed."

    return {
        "message": message,
        "batch": serialize_batch(batch),
    }


@router.post("/batches/{batch_id}/cancel", response_model=ProductOrderBatchActionResponse)
def cancel_order_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        batch = OrderService.cancel_batch(db, user.id, batch_id)
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if detail == "Order batch not found" else 400
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return {
        "message": "Batch cancelled successfully",
        "batch": serialize_batch(batch),
    }


@router.post("/batches/{batch_id}/items/{item_id}/cancel", response_model=ProductOrderBatchActionResponse)
def cancel_order_batch_item(
    batch_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        batch = OrderService.cancel_batch_item(db, user.id, batch_id, item_id)
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if detail in {"Order batch not found", "Batch item not found"} else 400
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return {
        "message": "Batch item cancelled successfully",
        "batch": serialize_batch(batch),
    }


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
