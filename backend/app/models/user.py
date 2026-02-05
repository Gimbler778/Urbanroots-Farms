from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    image= Column(String, nullable=True)
    passwordHash = Column(String, nullable=False)
    emailVerified = Column(Boolean, default=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())


class Session(Base):
    __tablename__ = "session"

    id = Column(String, primary_key=True, index=True)
    expiresAt = Column(DateTime(timezone=True), nullable=False)
    ipAddress = Column(String, nullable=True)
    userAgent = Column(String, nullable=True)
    userId = Column(String, nullable=False, index=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())


class Account(Base):
    __tablename__ = "account"

    id = Column(String, primary_key=True, index=True)
    accountId = Column(String, nullable=False)
    providerId = Column(String, nullable=False)
    userId = Column(String, nullable=False, index=True)
    accessToken = Column(String, nullable=True)
    refreshToken = Column(String, nullable=True)
    idToken = Column(String, nullable=True)
    expiresAt = Column(DateTime(timezone=True), nullable=True)
    password = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())


class Verification(Base):
    __tablename__ = "verification"

    id = Column(String, primary_key=True, index=True)
    identifier = Column(String, nullable=False)
    value = Column(String, nullable=False)
    expiresAt = Column(DateTime(timezone=True), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
