# import random
# from fastapi import APIRouter, Request, Response, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.models import User, Session as AuthSession, Account, Verification
# import bcrypt
# from datetime import datetime, timedelta, timezone
# from jose import jwt
# import secrets
# from app.core.config import settings
# from pydantic import BaseModel, EmailStr

# router = APIRouter(prefix="/auth", tags=["auth"])


# class SignUpRequest(BaseModel):
#     name: str
#     email: EmailStr
#     password: str


# class SignInRequest(BaseModel):
#     email: EmailStr
#     password: str


# class UserResponse(BaseModel):
#     id: str
#     name: str
#     email: str
#     emailVerified: bool
#     image: str | None = None


# def hash_password(password: str) -> str:
#     # Convert password to bytes and hash it
#     password_bytes = password.encode('utf-8')
#     salt = bcrypt.gensalt()
#     hashed = bcrypt.hashpw(password_bytes, salt)
#     return hashed.decode('utf-8')


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     # Convert both to bytes and verify
#     password_bytes = plain_password.encode('utf-8')
#     hashed_bytes = hashed_password.encode('utf-8')
#     return bcrypt.checkpw(password_bytes, hashed_bytes)


# def create_access_token(user_id: str) -> str:
#     expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
#     expire = datetime.utcnow() + expires_delta
#     to_encode = {"sub": user_id, "exp": expire}
#     encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
#     return encoded_jwt


# def create_session(db: Session, user_id: str, request: Request) -> AuthSession:
#     session_id = secrets.token_urlsafe(32)
#     session = AuthSession(
#         id=session_id,
#         userId=user_id,
#         expiresAt=datetime.now(timezone.utc) + timedelta(days=30),
#         ipAddress=request.client.host if request.client else None,
#         userAgent=request.headers.get("user-agent", "")
#     )
#     db.add(session)
#     db.commit()
#     return session


# @router.post("/sign-up/email")
# async def sign_up(
#     sign_up_data: SignUpRequest,
#     request: Request,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     # Check if user already exists
#     existing_user = db.query(User).filter(User.email == sign_up_data.email).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
    
    
#     # Create new user
#     user_id = secrets.token_urlsafe(16)
#     new_user = User(
#         id=user_id,
#         name=sign_up_data.name,
#         email=sign_up_data.email,
#         emailVerified=False
#     )
#     db.add(new_user)
    
#     # Create account with hashed password
#     account_id = secrets.token_urlsafe(16)
#     new_account = Account(
#         id=account_id,
#         accountId=sign_up_data.email,
#         providerId="credential",
#         userId=user_id,
#         password=hash_password(sign_up_data.password)
#     )
#     db.add(new_account)
    
#     # Create email verification token
#     verification_token = secrets.token_urlsafe(32)
#     verification = Verification(
#         id=secrets.token_urlsafe(16),
#         identifier=sign_up_data.email,
#         value=verification_token,
#         expiresAt=datetime.now(timezone.utc) + timedelta(hours=24)
#     )
#     db.add(verification)
    
#     db.commit()
    
#     # In production, send email here with verification link:
#     # verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
#     # send_email(sign_up_data.email, verification_url)
    
#     print(f"\n=== EMAIL VERIFICATION ===")
#     print(f"User: {sign_up_data.email}")
#     print(f"Verification URL: {settings.frontend_url}/verify-email?token={verification_token}")
#     print(f"Or visit: http://localhost:8000/api/auth/verify-email?token={verification_token}")
#     print(f"========================\n")
    
#     return {
#         "message": "Account created successfully. Please check your email to verify your account.",
#         "email": sign_up_data.email
#     }


# @router.post("/sign-in/email")
# async def sign_in(
#     sign_in_data: SignInRequest,
#     request: Request,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     # Find user by email
#     user = db.query(User).filter(User.email == sign_in_data.email).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid email or password")
    
#     # Find account
#     account = db.query(Account).filter(
#         Account.userId == user.id,
#         Account.providerId == "credential"
#     ).first()
    
#     if not account or not account.password:
#         raise HTTPException(status_code=401, detail="Invalid email or password")
    
#     # Verify password
#     if not verify_password(sign_in_data.password, account.password):
#         raise HTTPException(status_code=401, detail="Invalid email or password")
    
#     # Check if email is verified
#     if not user.emailVerified:
#         raise HTTPException(
#             status_code=403, 
#             detail="Please verify your email before signing in. Check your email for the verification link."
#         )
    
#     # Create session
#     session = create_session(db, user.id, request)
    
#     # Set session cookie
#     response.set_cookie(
#         key="better-auth.session_token",
#         value=session.id,
#         httponly=True,
#         secure=False,  # Set to True in production with HTTPS
#         samesite="lax",
#         max_age=30 * 24 * 60 * 60  # 30 days
#     )
    
#     return {
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "email": user.email,
#             "emailVerified": user.emailVerified,
#             "image": user.image
#         },
#         "session": {
#             "id": session.id,
#             "userId": session.userId,
#             "expiresAt": session.expiresAt.isoformat()
#         }
#     }


# @router.post("/sign-out")
# async def sign_out(
#     request: Request,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     session_token = request.cookies.get("better-auth.session_token")
    
#     if session_token:
#         # Delete session from database
#         session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
#         if session:
#             db.delete(session)
#             db.commit()
    
#     # Clear cookie
#     response.delete_cookie(key="better-auth.session_token")
    
#     return {"success": True}


# @router.get("/get-session")
# async def get_session(
#     request: Request,
#     db: Session = Depends(get_db)
# ):
#     session_token = request.cookies.get("better-auth.session_token")
    
#     if not session_token:
#         return {"user": None, "session": None}
    
#     # Find session
#     session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
    
#     if not session or session.expiresAt < datetime.now(timezone.utc):
#         return {"user": None, "session": None}
    
#     # Find user
#     user = db.query(User).filter(User.id == session.userId).first()
    
#     if not user:
#         return {"user": None, "session": None}
    
#     return {
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "email": user.email,
#             "emailVerified": user.emailVerified,
#             "image": user.image
#         },
#         "session": {
#             "id": session.id,
#             "userId": session.userId,
#             "expiresAt": session.expiresAt.isoformat()
#         }
#     }


# @router.get("/verify-email")
# async def verify_email(
#     token: str,
#     request: Request,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     # Find verification token
#     verification = db.query(Verification).filter(Verification.value == token).first()
    
#     if not verification:
#         # Check if user is already verified
#         # Try to find if this token was already used by checking recent sessions
#         raise HTTPException(
#             status_code=400, 
#             detail="Invalid or already used verification token. If you already verified your email, please try signing in."
#         )
    
#     # Check if token is expired
#     if verification.expiresAt < datetime.now(timezone.utc):
#         db.delete(verification)
#         db.commit()
#         raise HTTPException(status_code=400, detail="Verification token has expired. Please sign up again.")
    
#     # Find user by email
#     user = db.query(User).filter(User.email == verification.identifier).first()
    
#     if not user:
#         raise HTTPException(status_code=400, detail="User not found")
    
#     # Mark email as verified
#     user.emailVerified = True
    
#     # Create session automatically after verification
#     session = create_session(db, user.id, request)
    
#     # Delete used verification token
#     db.delete(verification)
#     db.commit()
    
#     # Set session cookie
#     response.set_cookie(
#         key="better-auth.session_token",
#         value=session.id,
#         httponly=True,
#         secure=False,
#         samesite="lax",
#         max_age=30 * 24 * 60 * 60
#     )
    
#     return {
#         "message": "Email verified successfully!",
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "email": user.email,
#             "emailVerified": user.emailVerified,
#             "image": user.image
#         }
#     }






import secrets
import random
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.database import get_db
from app.core.config import settings
from app.models import User, Verification, Session as AuthSession

router = APIRouter(prefix="/api/auth", tags=["auth"])

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class ResendOTPRequest(BaseModel):
    email: EmailStr


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

async def send_otp_email(email: str, otp: str):
    try:
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    text-align: center;
                    background-color: #ffffff;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #2e7d32; /* UrbanRoots Green */
                    margin-bottom: 20px;
                }}
                .content {{
                    color: #555555;
                    line-height: 1.6;
                }}
                .otp-code {{
                    display: inline-block;
                    margin: 25px 0;
                    padding: 15px 30px;
                    font-size: 32px;
                    font-weight: 800;
                    letter-spacing: 5px;
                    color: #ffffff;
                    background-color: #4CAF50;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
                }}
                .footer {{
                    margin-top: 25px;
                    font-size: 12px;
                    color: #999999;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">UrbanRoots</div>
                <div class="content">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p>Thank you for joining UrbanRoots! Use the verification code below to complete your registration. It will expire in <strong>5 minutes</strong>.</p>
                    <div class="otp-code">{otp}</div>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; {datetime.now().year} UrbanRoots. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """

        message = MessageSchema(
            subject="UrbanRoots Email Verification",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)

    except Exception as e:
        print("Email send failed:", e)



@router.post("/sign-up/email", status_code=status.HTTP_201_CREATED)
async def sign_up(
    data: SignUpRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        user_id = secrets.token_urlsafe(16)

        user = User(
            id=user_id,
            name=data.name,
            email=data.email,
            passwordHash=hash_password(data.password),
            emailVerified=False
        )
        db.add(user)

        db.query(Verification).filter(
            Verification.identifier == data.email
        ).delete()

        otp_code = f"{random.randint(100000, 999999)}"

        verification = Verification(
            id=secrets.token_urlsafe(16),
            identifier=data.email,
            value=otp_code,
            expiresAt=datetime.now(timezone.utc) + timedelta(minutes=5)
        )

        db.add(verification)
        db.commit()

        background_tasks.add_task(send_otp_email, data.email, otp_code)

        return {
            "message": "User created. Please verify your email.",
            "email": data.email
        }

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/verify-email")
async def verify_email(
    data: VerifyOTPRequest,
    response: Response,
    db: Session = Depends(get_db)
):

    verification = db.query(Verification).filter(
        Verification.identifier == data.email,
        Verification.value == data.otp
    ).first()

    if not verification:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if verification.expiresAt < datetime.now(timezone.utc):
        db.delete(verification)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired")

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.emailVerified = True

    session_id = secrets.token_urlsafe(32)
    session = AuthSession(
        id=session_id,
        userId=user.id,
        expiresAt=datetime.now(timezone.utc) + timedelta(days=30)
    )

    db.add(session)
    db.delete(verification)
    db.commit()

    response.set_cookie(
        key="better-auth.session_token",
        value=session_id,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000
    )

    return {"status": "success", "message": "Email verified successfully"}

@router.post("/resend-otp")
async def resend_otp(
    data: ResendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.emailVerified:
        raise HTTPException(status_code=400, detail="Email already verified")

    db.query(Verification).filter(
        Verification.identifier == data.email
    ).delete()

    otp_code = f"{random.randint(100000, 999999)}"

    verification = Verification(
        id=secrets.token_urlsafe(16),
        identifier=data.email,
        value=otp_code,
        expiresAt=datetime.now(timezone.utc) + timedelta(minutes=5)
    )

    db.add(verification)
    db.commit()
    background_tasks.add_task(send_otp_email, data.email, otp_code)

    return {"message": "OTP resent successfully"}


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

@router.post("/sign-in")
async def sign_in(
    data: SignInRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    if not user.emailVerified:
        db.query(Verification).filter(
            Verification.identifier == data.email
        ).delete()

        db.delete(user)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Email not verified. Please signup again."
        )

    if not verify_password(data.password, user.passwordHash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    session_id = secrets.token_urlsafe(32)

    session = AuthSession(
        id=session_id,
        userId=user.id,
        expiresAt=datetime.now(timezone.utc) + timedelta(days=30)
    )

    db.add(session)
    db.commit()

    response.set_cookie(
        key="better-auth.session_token",
        value=session_id,
        httponly=True,
        secure=False,   
        samesite="lax",
        max_age=2592000
    )

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
    }
   
@router.post("/forgot-password-email")
async def forgot_password_email(
    data: ResendOTPRequest,  
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = f"{random.randint(100000, 999999)}"

    verification = db.query(Verification).filter(
        Verification.identifier == data.email
    ).first()

    if verification:
        verification.value = otp_code
        verification.expiresAt = datetime.now(timezone.utc) + timedelta(minutes=5)
    else:
        verification = Verification(
            id=secrets.token_urlsafe(16),
            identifier=data.email,
            value=otp_code,
            expiresAt=datetime.now(timezone.utc) + timedelta(minutes=5)
        )
        db.add(verification)

    db.commit()
    background_tasks.add_task(send_otp_email, data.email, otp_code)

    return {"message": "Password reset OTP sent to email"}

class VerifyForgotOTPRequest(BaseModel):
    email: EmailStr
    otp: str

@router.post("/verify-forgot-otp")
async def verify_forgot_otp(
    data: VerifyForgotOTPRequest,
    db: Session = Depends(get_db)
):
    verification = db.query(Verification).filter(
        Verification.identifier == data.email,
        Verification.value == data.otp
    ).first()

    if not verification:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if verification.expiresAt < datetime.now(timezone.utc):
        db.delete(verification)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired")

    return {"message": "OTP verified successfully"}

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    newPassword: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    newPassword: str

@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.passwordHash = hash_password(data.newPassword)
    user.emailVerified=True

    db.query(Verification).filter(
        Verification.identifier == data.email
    ).delete()

    db.commit()

    return {"message": "Password updated successfully"}

@router.post("/forgotpassword-resend-otp")
async def resend_otp(
    data: ResendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(Verification).filter(
        Verification.identifier == data.email
    ).delete()

    otp_code = f"{random.randint(100000, 999999)}"

    verification = Verification(
        id=secrets.token_urlsafe(16),
        identifier=data.email,
        value=otp_code,
        expiresAt=datetime.now(timezone.utc) + timedelta(minutes=5)
    )

    db.add(verification)
    db.commit()

    background_tasks.add_task(send_otp_email, data.email, otp_code)

    return {"message": "OTP resent successfully"}


