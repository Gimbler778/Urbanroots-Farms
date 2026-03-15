from typing import List
from html import escape
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload
from app.core.config import settings
from app.core.database import get_db
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.api.dependencies import get_current_user
from app.models import Order, OrderItem, PodRental, User
from app.schemas import OrderHistoryItem, PodRentalCreate, PodRentalResponse
from app.services.pod_rental_service import PodRentalService

router = APIRouter(tags=["pod-rentals"])

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


def build_admin_email(rental: PodRental) -> str:
  full_name = escape(rental.full_name)
  email = escape(rental.email)
  phone = escape(rental.phone)
  pod_name = escape(rental.pod_name)
  pod_size = escape(rental.pod_size)
  preferred_start_date = escape(rental.preferred_start_date)
  location_type = escape(rental.location_type)
  building_name = escape(rental.building_name) if rental.building_name else "-"
  installation_address = escape(rental.installation_address)
  city = escape(rental.city)
  state = escape(rental.state)
  zip_code = escape(rental.zip_code)
  growing_goals = escape(rental.growing_goals) if rental.growing_goals else "-"
  notes = escape(rental.notes) if rental.notes else "-"

  return f"""
    <div style="font-family:'Segoe UI',sans-serif;background:#f6f4ee;padding:24px;color:#29402b;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd1;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(39,60,35,0.12);">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#4d8d43,#7abd68);color:#ffffff;">
          <div style="font-size:22px;font-weight:700;">UrbanRoots • New Pod Rental Request</div>
          <div style="margin-top:6px;opacity:0.92;">{pod_name} for {full_name}</div>
        </div>
        <div style="padding:24px;line-height:1.65;">
          <p style="margin-top:0;">A new rental request has been submitted.</p>
          <div style="background:#f3f8f1;border:1px solid #dce8d7;border-radius:12px;padding:16px 18px;">
            <strong>Contact</strong>
            <ul style="margin:10px 0 0 18px;padding:0;">
              <li>Name: {full_name}</li>
              <li>Email: {email}</li>
              <li>Phone: {phone}</li>
            </ul>
          </div>
          <div style="margin-top:14px;background:#fff7ed;border:1px solid #eadbc7;border-radius:12px;padding:16px 18px;">
            <strong>Rental</strong>
            <ul style="margin:10px 0 0 18px;padding:0;">
              <li>Plan: {pod_name} ({pod_size})</li>
              <li>Monthly price: Rs. {rental.monthly_price:,.0f}</li>
              <li>Installation fee: Rs. {rental.installation_fee:,.0f}</li>
              <li>Preferred start date: {preferred_start_date}</li>
              <li>Rental term: {rental.rental_term_months} months</li>
              <li>Location type: {location_type}</li>
              <li>Building name: {building_name}</li>
              <li>Installation address: {installation_address}, {city}, {state} {zip_code}</li>
              <li>Growing goals: {growing_goals}</li>
              <li>Notes: {notes}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    """


def build_customer_email(rental: PodRental) -> str:
  full_name = escape(rental.full_name)
  pod_name = escape(rental.pod_name)
  preferred_start_date = escape(rental.preferred_start_date)
  status = escape(rental.status.value.replace('_', ' ').title())
  installation_address = escape(rental.installation_address)
  city = escape(rental.city)
  state = escape(rental.state)
  zip_code = escape(rental.zip_code)

  return f"""
    <div style="font-family:'Segoe UI',sans-serif;background:#f6f4ee;padding:24px;color:#29402b;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd1;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(39,60,35,0.12);">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#4d8d43,#7abd68);color:#ffffff;">
          <div style="font-size:22px;font-weight:700;">UrbanRoots • Rental Request Received</div>
          <div style="margin-top:6px;opacity:0.92;">We saved your {pod_name} request.</div>
        </div>
        <div style="padding:24px;line-height:1.65;">
          <p style="margin-top:0;">Hi {full_name}, thanks for starting your UrbanRoots rental request. Our team will review the details and contact you to confirm installation timing.</p>
          <div style="background:#f3f8f1;border:1px solid #dce8d7;border-radius:12px;padding:16px 18px;">
            <strong>Request summary</strong>
            <ul style="margin:10px 0 0 18px;padding:0;">
              <li>Plan: {pod_name}</li>
              <li>Monthly price: Rs. {rental.monthly_price:,.0f}</li>
              <li>Installation fee: Rs. {rental.installation_fee:,.0f}</li>
              <li>Preferred start date: {preferred_start_date}</li>
              <li>Rental term: {rental.rental_term_months} months</li>
              <li>Status: {status}</li>
            </ul>
          </div>
          <div style="margin-top:14px;background:#fff7ed;border:1px solid #eadbc7;border-radius:12px;padding:16px 18px;">
            <strong>Installation location</strong>
            <p style="margin:10px 0 0 0;">{installation_address}, {city}, {state} {zip_code}</p>
          </div>
          <p style="margin-bottom:0;margin-top:18px;font-size:13px;color:#617060;">You can track this request from the My Orders section after signing in.</p>
        </div>
      </div>
    </div>
    """


async def send_pod_rental_emails(rental: PodRental) -> None:
  fm = FastMail(conf)

  admin_message = MessageSchema(
        subject=f"New Pod Rental Request • {rental.full_name}",
    recipients=[settings.admin_email],
    body=build_admin_email(rental),
    subtype=MessageType.html,
        reply_to=[rental.email],
    )
  customer_message = MessageSchema(
        subject="Your UrbanRoots pod rental request",
        recipients=[rental.email],
    body=build_customer_email(rental),
    subtype=MessageType.html,
    reply_to=[settings.admin_email],
    )

  await fm.send_message(admin_message)
  await fm.send_message(customer_message)


@router.post("/pod-rentals", response_model=PodRentalResponse, status_code=status.HTTP_201_CREATED)
async def create_pod_rental(
  payload: PodRentalCreate,
  db: Session = Depends(get_db),
  user: User = Depends(get_current_user),
):

    if not payload.terms_accepted:
        raise HTTPException(status_code=400, detail="Please accept the terms before submitting")

    try:
        rental = PodRentalService.create_pod_rental(db, user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    email_delivered = True
    message = "Rental request saved and summary emails were sent."

    try:
        await send_pod_rental_emails(rental)
    except Exception:
        email_delivered = False
        message = "Rental request saved, but summary email delivery could not be confirmed."

    return {
        "rental": rental,
        "email_delivered": email_delivered,
        "message": message,
    }


@router.get("/my-orders", response_model=List[OrderHistoryItem])
def get_my_orders(
  db: Session = Depends(get_db),
  user: User = Depends(get_current_user),
):

  product_orders = (
    db.query(Order)
    .options(joinedload(Order.items).joinedload(OrderItem.product))
    .filter(Order.user_id == user.id)
    .all()
  )
  pod_rentals = db.query(PodRental).filter(PodRental.user_id == user.id).all()

  history: list[dict] = []

  for order in product_orders:
    item_summary = ", ".join(
      f"{item.quantity} x {item.product.name if item.product else 'Unknown product'}" for item in order.items
    ) or "Items unavailable"
    history.append({
      "id": order.id,
      "type": "product",
      "title": f"Product Order #{order.id[:8]}",
      "subtitle": item_summary,
      "status": order.status.value if hasattr(order.status, "value") else str(order.status),
      "created_at": order.created_at,
      "total": order.total,
      "item_count": sum(item.quantity for item in order.items),
      "details": {
        "Items": item_summary,
        "Booked on": order.created_at.strftime("%d %b %Y"),
        "Delivery city": f"{order.city}, {order.state}",
        "Phone": order.phone,
      },
    })

  for rental in pod_rentals:
    history.append({
      "id": rental.id,
      "type": "pod_rental",
      "title": rental.pod_name,
      "subtitle": f"{rental.location_type} • {rental.city}, {rental.state}",
      "status": rental.status.value if hasattr(rental.status, "value") else str(rental.status),
      "created_at": rental.created_at,
      "monthly_price": rental.monthly_price,
      "installation_fee": rental.installation_fee,
      "pod_size": rental.pod_size,
      "preferred_start_date": rental.preferred_start_date,
      "rental_term_months": rental.rental_term_months,
      "details": {
        "Preferred start": rental.preferred_start_date,
        "Rental term": f"{rental.rental_term_months} months",
        "Installation address": f"{rental.installation_address}, {rental.city}, {rental.state} {rental.zip_code}",
        "Contact": f"{rental.full_name} • {rental.phone}",
      },
    })

  history.sort(key=lambda item: item["created_at"], reverse=True)
  return history
