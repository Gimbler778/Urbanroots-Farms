from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Session as AuthSession, User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    session_token = request.cookies.get("better-auth.session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Please sign in to continue")

    session = db.query(AuthSession).filter(AuthSession.id == session_token).first()
    if not session or session.expiresAt < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again")

    user = db.query(User).filter(User.id == session.userId).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
