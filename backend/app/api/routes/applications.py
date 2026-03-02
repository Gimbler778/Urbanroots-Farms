from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.config import settings
from app.core.database import get_db
from app.models import User, Session as AuthSession


router = APIRouter(tags=["applications"])


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


class BuildingApplication(BaseModel):
    full_name: str
    phone: str
    building_name: str
    address: str
    building_type: str
    space_size: str
    additional_info: str | None = None


def get_current_user(request: Request, db: Session) -> User:
    session_token = request.cookies.get("better-auth.session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Please sign in to apply")

    session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
    if not session or session.expiresAt < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again")

    user = db.query(User).filter(User.id == session.userId).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def send_application_emails(application: BuildingApplication, applicant_email: str) -> None:
    fm = FastMail(conf)

    def admin_template() -> str:
                return f"""
                <div style="font-family: 'Segoe UI', sans-serif; background: #f7f5f0; padding: 24px; color: #2e3b2c;">
                    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e6e0d4; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(57, 85, 64, 0.12);">
                        <div style="background: linear-gradient(120deg, #4b8f3a, #6fb36a); padding: 18px 24px; color: #fefefe;">
                            <div style="font-size: 20px; font-weight: 700; letter-spacing: 0.4px;">UrbanRoots • New Building Application</div>
                            <div style="opacity: 0.9; margin-top: 4px;">Submitted by {application.full_name}</div>
                        </div>
                        <div style="padding: 24px 24px 12px 24px;">
                            <p style="margin: 0 0 12px 0; font-size: 15px;">A new building application was submitted. Details below:</p>
                            <div style="background: #f3f8f2; border: 1px solid #dfe8dd; border-radius: 10px; padding: 16px 18px;">
                                <div style="margin-bottom: 8px; font-weight: 700; color: #365c3c;">Applicant</div>
                                <ul style="padding-left: 18px; margin: 0; line-height: 1.6;">
                                    <li><strong>Name:</strong> {application.full_name}</li>
                                    <li><strong>Email:</strong> {applicant_email}</li>
                                    <li><strong>Phone:</strong> {application.phone}</li>
                                </ul>
                            </div>
                            <div style="margin-top: 14px; background: #fff7ed; border: 1px solid #eadcc9; border-radius: 10px; padding: 16px 18px;">
                                <div style="margin-bottom: 8px; font-weight: 700; color: #7a5c3f;">Building</div>
                                <ul style="padding-left: 18px; margin: 0; line-height: 1.6;">
                                    <li><strong>Name:</strong> {application.building_name}</li>
                                    <li><strong>Address:</strong> {application.address}</li>
                                    <li><strong>Type:</strong> {application.building_type}</li>
                                    <li><strong>Space:</strong> {application.space_size}</li>
                                    <li><strong>Notes:</strong> {application.additional_info or "-"}</li>
                                </ul>
                            </div>
                        </div>
                        <div style="padding: 14px 24px 18px 24px; background: #f1f4f1; color: #4a5c48; font-size: 12px;">
                            UrbanRoots • Please reach out within 2 business days.
                        </div>
                    </div>
                </div>
                """

    def applicant_template() -> str:
                return f"""
                <div style="font-family: 'Segoe UI', sans-serif; background: #f7f5f0; padding: 24px; color: #2e3b2c;">
                    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e6e0d4; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(57, 85, 64, 0.12);">
                        <div style="background: linear-gradient(120deg, #4b8f3a, #6fb36a); padding: 18px 24px; color: #fefefe;">
                            <div style="font-size: 20px; font-weight: 700; letter-spacing: 0.4px;">UrbanRoots • Application Received</div>
                            <div style="opacity: 0.9; margin-top: 4px;">Hi {application.full_name}, we got your request.</div>
                        </div>
                        <div style="padding: 24px 24px 12px 24px;">
                            <p style="margin: 0 0 12px 0; font-size: 15px;">Thanks for applying to turn your space into an UrbanRoots farm. We will contact you within 2-3 business days.</p>
                            <div style="background: #f3f8f2; border: 1px solid #dfe8dd; border-radius: 10px; padding: 16px 18px;">
                                <div style="margin-bottom: 8px; font-weight: 700; color: #365c3c;">Your Details</div>
                                <ul style="padding-left: 18px; margin: 0; line-height: 1.6;">
                                    <li><strong>Name:</strong> {application.full_name}</li>
                                    <li><strong>Email:</strong> {applicant_email}</li>
                                    <li><strong>Phone:</strong> {application.phone}</li>
                                </ul>
                            </div>
                            <div style="margin-top: 14px; background: #fff7ed; border: 1px solid #eadcc9; border-radius: 10px; padding: 16px 18px;">
                                <div style="margin-bottom: 8px; font-weight: 700; color: #7a5c3f;">Building Summary</div>
                                <ul style="padding-left: 18px; margin: 0; line-height: 1.6;">
                                    <li><strong>Name:</strong> {application.building_name}</li>
                                    <li><strong>Address:</strong> {application.address}</li>
                                    <li><strong>Type:</strong> {application.building_type}</li>
                                    <li><strong>Space:</strong> {application.space_size}</li>
                                    <li><strong>Notes:</strong> {application.additional_info or "-"}</li>
                                </ul>
                            </div>
                            <p style="margin: 16px 0 0 0; font-size: 13px; color: #5d6b59;">If you need to update details, reply to this email and our team will help.</p>
                        </div>
                        <div style="padding: 14px 24px 18px 24px; background: #f1f4f1; color: #4a5c48; font-size: 12px;">
                            UrbanRoots • Growing greener cities together.
                        </div>
                    </div>
                </div>
                """

    admin_message = MessageSchema(
        subject=f"New Building Application • {application.full_name}",
        recipients=["urbanrootsfarms2000@gmail.com"],
        body=admin_template(),
        subtype=MessageType.html,
        reply_to=[applicant_email],
    )

    applicant_message = MessageSchema(
        subject="We received your UrbanRoots application",
        recipients=[applicant_email],
        body=applicant_template(),
        subtype=MessageType.html,
        reply_to=[applicant_email],
    )

    await fm.send_message(admin_message)
    await fm.send_message(applicant_message)


@router.post("/applications", status_code=status.HTTP_201_CREATED)
async def submit_application(
    application: BuildingApplication,
    request: Request,
    db: Session = Depends(get_db)
):
    user = get_current_user(request, db)
    try:
        await send_application_emails(application, user.email)
        return {"message": "Application submitted"}
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Failed to send application emails") from exc
