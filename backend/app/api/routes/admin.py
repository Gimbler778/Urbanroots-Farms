from html import escape
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_admin
from app.core.config import settings
from app.core.database import get_db
from app.models import (
    BuildingApplication,
    PodRental,
    Product,
    ProductOrderBatch,
    ProductOrderBatchItem,
    ProductOrderBatchItemStatus,
    ProductOrderBatchStatus,
    User,
)
from app.schemas import (
    BuildingApplication as BuildingApplicationSchema,
    BuildingApplicationStatusUpdate,
    PodRental as PodRentalSchema,
    PodRentalStatusUpdate,
    Product as ProductSchema,
    ProductOrderBatchActionResponse,
    ProductOrderBatchItemStatusUpdate,
    ProductOrderBatchStatusUpdate,
    ProductOrderBatchSummary,
    ProductCreate,
    ProductUpdate,
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/admin", tags=["admin"])

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


def _status_label(value: str) -> str:
        return value.replace("_", " ").title()


def _batch_email_snapshot(batch: ProductOrderBatch) -> dict:
        batch_status = str(batch.status.value if hasattr(batch.status, "value") else batch.status)
        return {
                "batch_ref": batch.batch_ref,
                "customer_name": batch.customer_name,
                "customer_email": batch.customer_email,
                "status": batch_status,
                "subtotal": float(batch.subtotal or 0),
                "tax": float(batch.tax or 0),
                "total": float(batch.total or 0),
                "items": [
                        {
                                "name": item.name,
                                "quantity": item.quantity,
                                "unit_price": float(item.unit_price),
                                "line_total": float(item.line_total),
                                "status": str(item.status.value if hasattr(item.status, "value") else item.status),
                        }
                        for item in batch.items
                ],
        }


def _build_batch_status_email_html(snapshot: dict, reason: str) -> str:
        rows = "".join(
                f"""
                <tr>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;">{escape(item['name'])}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:center;">{item['quantity']}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">Rs. {item['unit_price']:,.2f}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">Rs. {item['line_total']:,.2f}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid #e6e1d6;text-align:right;">{_status_label(item['status'])}</td>
                </tr>
                """
                for item in snapshot["items"]
        )

        return f"""
            <div style="font-family:'Segoe UI',sans-serif;background:#f6f4ee;padding:24px;color:#29402b;">
                <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd1;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(39,60,35,0.12);">
                    <div style="padding:20px 24px;background:linear-gradient(135deg,#4d8d43,#7abd68);color:#ffffff;">
                        <div style="font-size:22px;font-weight:700;">UrbanRoots • Batch Status Updated</div>
                        <div style="margin-top:6px;opacity:0.92;">Batch {escape(snapshot['batch_ref'])}</div>
                    </div>
                    <div style="padding:24px;line-height:1.65;">
                        <p style="margin-top:0;">Hi {escape(snapshot['customer_name'])}, {escape(reason)}.</p>
                        <ul style="margin:10px 0 0 18px;padding:0;">
                            <li>Batch reference: {escape(snapshot['batch_ref'])}</li>
                            <li>Current batch status: {_status_label(snapshot['status'])}</li>
                            <li>Subtotal: Rs. {snapshot['subtotal']:,.2f}</li>
                            <li>Tax: Rs. {snapshot['tax']:,.2f}</li>
                            <li>Total: Rs. {snapshot['total']:,.2f}</li>
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
                        <p style="margin-top:16px;font-size:13px;color:#617060;">You can track all updates in My Orders.</p>
                    </div>
                </div>
            </div>
        """


async def send_customer_batch_status_email(snapshot: dict, reason: str) -> None:
        fm = FastMail(conf)
        message = MessageSchema(
                subject=f"UrbanRoots order update • {snapshot['batch_ref']}",
                recipients=[snapshot["customer_email"]],
                body=_build_batch_status_email_html(snapshot, reason),
                subtype=MessageType.html,
                reply_to=[settings.admin_email],
        )
        await fm.send_message(message)


def serialize_batch(batch: ProductOrderBatch) -> ProductOrderBatchSummary:
    active_items = [item for item in batch.items if item.status != ProductOrderBatchItemStatus.CANCELLED]
    subtotal = round(sum(item.line_total for item in active_items), 2)
    tax = round(subtotal * 0.08, 2)
    total = round(subtotal + tax, 2)
    batch.subtotal = subtotal
    batch.tax = tax
    batch.total = total

    if batch.items and all(item.status == ProductOrderBatchItemStatus.COMPLETED for item in batch.items):
        batch.status = ProductOrderBatchStatus.COMPLETED
    elif batch.items and all(item.status == ProductOrderBatchItemStatus.REQUESTED for item in batch.items):
        if batch.status not in {ProductOrderBatchStatus.CONTACT_SCHEDULE, ProductOrderBatchStatus.PROCESSING}:
            batch.status = ProductOrderBatchStatus.REQUESTED
    elif batch.items and all(item.status == ProductOrderBatchItemStatus.CANCELLED for item in batch.items):
        if batch.status not in {ProductOrderBatchStatus.CONTACT_SCHEDULE, ProductOrderBatchStatus.PROCESSING}:
            batch.status = ProductOrderBatchStatus.PROCESSING
    else:
        if batch.status not in {ProductOrderBatchStatus.CONTACT_SCHEDULE, ProductOrderBatchStatus.PROCESSING}:
            batch.status = ProductOrderBatchStatus.PROCESSING

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
        item_count=sum(item.quantity for item in active_items),
        created_at=batch.created_at,
        updated_at=batch.updated_at,
        items=batch.items,
    )


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    products = db.query(Product).all()
    pod_rentals = db.query(PodRental).order_by(PodRental.created_at.desc()).all()
    building_applications = db.query(BuildingApplication).order_by(BuildingApplication.created_at.desc()).all()

    return {
        "metrics": {
            "products": len(products),
            "pod_rentals": len(pod_rentals),
            "building_applications": len(building_applications),
            "product_order_batches": db.query(ProductOrderBatch).count(),
            "pending_pod_rentals": sum(1 for row in pod_rentals if row.status.value == "requested"),
            "pending_applications": sum(1 for row in building_applications if row.status.value == "submitted"),
            "pending_product_batches": db.query(ProductOrderBatch).filter(ProductOrderBatch.status == ProductOrderBatchStatus.REQUESTED).count(),
        },
        "products": products,
        "pod_rentals": pod_rentals,
        "building_applications": building_applications,
    }


@router.get("/product-order-batches", response_model=list[ProductOrderBatchSummary])
def get_admin_product_order_batches(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    batches = db.query(ProductOrderBatch).order_by(ProductOrderBatch.created_at.desc()).all()
    return [serialize_batch(batch) for batch in batches]


@router.patch("/product-order-batches/{batch_id}", response_model=ProductOrderBatchActionResponse)
def update_admin_product_order_batch_status(
    batch_id: str,
    payload: ProductOrderBatchStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    batch = db.query(ProductOrderBatch).filter(ProductOrderBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Product order batch not found")

    if payload.status == ProductOrderBatchStatus.COMPLETED:
        for item in batch.items:
            if item.status != ProductOrderBatchItemStatus.CANCELLED:
                item.status = ProductOrderBatchItemStatus.COMPLETED
    elif payload.status == ProductOrderBatchStatus.CANCELLED:
        for item in batch.items:
            if item.status != ProductOrderBatchItemStatus.CANCELLED:
                if item.status == ProductOrderBatchItemStatus.REQUESTED:
                    product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                    if product:
                        product.stock += item.quantity
                item.status = ProductOrderBatchItemStatus.CANCELLED
    elif payload.status == ProductOrderBatchStatus.REQUESTED:
        for item in batch.items:
            if item.status == ProductOrderBatchItemStatus.COMPLETED:
                item.status = ProductOrderBatchItemStatus.REQUESTED
            elif item.status in {ProductOrderBatchItemStatus.PROCESSING, ProductOrderBatchItemStatus.CONTACT_SCHEDULE}:
                item.status = ProductOrderBatchItemStatus.REQUESTED

    batch.status = payload.status

    response_batch = serialize_batch(batch)
    db.commit()
    db.refresh(batch)
    snapshot = _batch_email_snapshot(batch)
    background_tasks.add_task(send_customer_batch_status_email, snapshot, "your batch status has been updated")

    return {
        "message": "Batch status updated",
        "batch": response_batch,
    }


@router.patch("/product-order-batches/{batch_id}/items/{item_id}", response_model=ProductOrderBatchActionResponse)
def update_admin_product_order_batch_item_status(
    batch_id: str,
    item_id: str,
    payload: ProductOrderBatchItemStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    batch = db.query(ProductOrderBatch).filter(ProductOrderBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Product order batch not found")

    item = db.query(ProductOrderBatchItem).filter(ProductOrderBatchItem.id == item_id, ProductOrderBatchItem.batch_id == batch_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product order batch item not found")

    if payload.status == ProductOrderBatchItemStatus.CANCELLED and item.status != ProductOrderBatchItemStatus.CANCELLED:
        if item.status == ProductOrderBatchItemStatus.REQUESTED:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product:
                product.stock += item.quantity
    item.status = payload.status

    response_batch = serialize_batch(batch)
    db.commit()
    db.refresh(batch)
    snapshot = _batch_email_snapshot(batch)
    background_tasks.add_task(send_customer_batch_status_email, snapshot, f"an item status has been updated to {_status_label(str(payload.status.value if hasattr(payload.status, 'value') else payload.status)).lower()}")

    return {
        "message": "Batch item status updated",
        "batch": response_batch,
    }


@router.get("/products", response_model=list[ProductSchema])
def get_admin_products(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(Product).all()


@router.post("/products", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
def create_admin_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return ProductService.create_product(db, payload)


@router.put("/products/{product_id}", response_model=ProductSchema)
def update_admin_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    updated = ProductService.update_product(db, product_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_product(
    product_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    if not ProductService.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")


@router.get("/pod-rentals", response_model=list[PodRentalSchema])
def get_admin_pod_rentals(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(PodRental).order_by(PodRental.created_at.desc()).all()


@router.patch("/pod-rentals/{rental_id}", response_model=PodRentalSchema)
def update_admin_pod_rental_status(
    rental_id: str,
    payload: PodRentalStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    rental = db.query(PodRental).filter(PodRental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Pod rental not found")

    rental.status = payload.status
    db.commit()
    db.refresh(rental)
    return rental


@router.get("/building-applications", response_model=list[BuildingApplicationSchema])
def get_admin_building_applications(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(BuildingApplication).order_by(BuildingApplication.created_at.desc()).all()


@router.patch("/building-applications/{application_id}", response_model=BuildingApplicationSchema)
def update_admin_building_application_status(
    application_id: str,
    payload: BuildingApplicationStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    application = db.query(BuildingApplication).filter(BuildingApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Building application not found")

    application.status = payload.status
    db.commit()
    db.refresh(application)
    return application
