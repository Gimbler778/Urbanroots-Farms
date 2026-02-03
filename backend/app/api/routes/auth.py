from fastapi import APIRouter, Request, Response, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Session as AuthSession, Account, Verification
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
import secrets
from app.core.config import settings
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    emailVerified: bool
    image: str | None = None


def hash_password(password: str) -> str:
    # Convert password to bytes and hash it
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Convert both to bytes and verify
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(user_id: str) -> str:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_session(db: Session, user_id: str, request: Request) -> AuthSession:
    session_id = secrets.token_urlsafe(32)
    session = AuthSession(
        id=session_id,
        userId=user_id,
        expiresAt=datetime.now(timezone.utc) + timedelta(days=30),
        ipAddress=request.client.host if request.client else None,
        userAgent=request.headers.get("user-agent", "")
    )
    db.add(session)
    db.commit()
    return session


@router.post("/sign-up/email")
async def sign_up(
    sign_up_data: SignUpRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == sign_up_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = secrets.token_urlsafe(16)
    new_user = User(
        id=user_id,
        name=sign_up_data.name,
        email=sign_up_data.email,
        emailVerified=False
    )
    db.add(new_user)
    
    # Create account with hashed password
    account_id = secrets.token_urlsafe(16)
    new_account = Account(
        id=account_id,
        accountId=sign_up_data.email,
        providerId="credential",
        userId=user_id,
        password=hash_password(sign_up_data.password)
    )
    db.add(new_account)
    
    # Create email verification token
    verification_token = secrets.token_urlsafe(32)
    verification = Verification(
        id=secrets.token_urlsafe(16),
        identifier=sign_up_data.email,
        value=verification_token,
        expiresAt=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    db.add(verification)
    
    db.commit()
    
    # In production, send email here with verification link:
    # verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
    # send_email(sign_up_data.email, verification_url)
    
    print(f"\n=== EMAIL VERIFICATION ===")
    print(f"User: {sign_up_data.email}")
    print(f"Verification URL: {settings.frontend_url}/verify-email?token={verification_token}")
    print(f"Or visit: http://localhost:8000/api/auth/verify-email?token={verification_token}")
    print(f"========================\n")
    
    return {
        "message": "Account created successfully. Please check your email to verify your account.",
        "email": sign_up_data.email
    }


@router.post("/sign-in/email")
async def sign_in(
    sign_in_data: SignInRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(User.email == sign_in_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Find account
    account = db.query(Account).filter(
        Account.userId == user.id,
        Account.providerId == "credential"
    ).first()
    
    if not account or not account.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(sign_in_data.password, account.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if email is verified
    if not user.emailVerified:
        raise HTTPException(
            status_code=403, 
            detail="Please verify your email before signing in. Check your email for the verification link."
        )
    
    # Create session
    session = create_session(db, user.id, request)
    
    # Set session cookie
    response.set_cookie(
        key="better-auth.session_token",
        value=session.id,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=30 * 24 * 60 * 60  # 30 days
    )
    
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "emailVerified": user.emailVerified,
            "image": user.image
        },
        "session": {
            "id": session.id,
            "userId": session.userId,
            "expiresAt": session.expiresAt.isoformat()
        }
    }


@router.post("/sign-out")
async def sign_out(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    session_token = request.cookies.get("better-auth.session_token")
    
    if session_token:
        # Delete session from database
        session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
        if session:
            db.delete(session)
            db.commit()
    
    # Clear cookie
    response.delete_cookie(key="better-auth.session_token")
    
    return {"success": True}


@router.get("/get-session")
async def get_session(
    request: Request,
    db: Session = Depends(get_db)
):
    session_token = request.cookies.get("better-auth.session_token")
    
    if not session_token:
        return {"user": None, "session": None}
    
    # Find session
    session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
    
    if not session or session.expiresAt < datetime.now(timezone.utc):
        return {"user": None, "session": None}
    
    # Find user
    user = db.query(User).filter(User.id == session.userId).first()
    
    if not user:
        return {"user": None, "session": None}
    
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "emailVerified": user.emailVerified,
            "image": user.image
        },
        "session": {
            "id": session.id,
            "userId": session.userId,
            "expiresAt": session.expiresAt.isoformat()
        }
    }


@router.get("/verify-email")
async def verify_email(
    token: str,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    # Find verification token
    verification = db.query(Verification).filter(Verification.value == token).first()
    
    if not verification:
        # Check if user is already verified
        # Try to find if this token was already used by checking recent sessions
        raise HTTPException(
            status_code=400, 
            detail="Invalid or already used verification token. If you already verified your email, please try signing in."
        )
    
    # Check if token is expired
    if verification.expiresAt < datetime.now(timezone.utc):
        db.delete(verification)
        db.commit()
        raise HTTPException(status_code=400, detail="Verification token has expired. Please sign up again.")
    
    # Find user by email
    user = db.query(User).filter(User.email == verification.identifier).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Mark email as verified
    user.emailVerified = True
    
    # Create session automatically after verification
    session = create_session(db, user.id, request)
    
    # Delete used verification token
    db.delete(verification)
    db.commit()
    
    # Set session cookie
    response.set_cookie(
        key="better-auth.session_token",
        value=session.id,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60
    )
    
    return {
        "message": "Email verified successfully!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "emailVerified": user.emailVerified,
            "image": user.image
        }
    }
