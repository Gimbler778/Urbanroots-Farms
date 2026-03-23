from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, Enum, SmallInteger, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base
import enum

# Import auth models
from app.models.user import User, Session, Account, Verification


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    image = Column(String, nullable=False)
    category = Column(String, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    organic = Column(Boolean, default=True)
    unit = Column(String, default="lb")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    total = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Shipping Information
    full_name = Column(String, nullable=False)
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    
    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class PodRentalStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONTACT_SCHEDULED = "contact_scheduled"
    RENTING = "renting"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUND_PENDING = "refund_pending"


class PodRental(Base):
    __tablename__ = "pod_rentals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    pod_plan_id = Column(String, nullable=False)
    pod_name = Column(String, nullable=False)
    pod_size = Column(String, nullable=False)
    monthly_price = Column(Float, nullable=False)
    installation_fee = Column(Float, nullable=False)
    status = Column(Enum(PodRentalStatus), default=PodRentalStatus.REQUESTED, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    # Legacy column kept for backward compatibility with existing production schema.
    installation_address = Column(Text, nullable=True)
    street_name = Column(String, nullable=False)
    house_number = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    preferred_start_date = Column(String, nullable=False)
    rental_term_months = Column(Integer, nullable=False)
    building_name = Column(String, nullable=True)
    location_type = Column(String, nullable=False)
    growing_goals = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    terms_accepted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PodReview(Base):
    __tablename__ = "pod_reviews"
    __table_args__ = (
        CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="ck_pod_reviews_rating_range"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pod_plan_id = Column(String, nullable=False, index=True)
    parent_id = Column(String, ForeignKey("pod_reviews.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    author_name = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    rating = Column(SmallInteger, nullable=True)
    depth = Column(SmallInteger, nullable=False, default=0)
    path = Column(Text, nullable=False, index=True)
    upvotes = Column(Integer, nullable=False, default=0)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parent = relationship("PodReview", remote_side=[id], backref="replies")

    @property
    def score(self) -> int:
        return self.upvotes


class PodReviewVote(Base):
    __tablename__ = "pod_review_votes"
    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="uq_pod_review_votes_review_user"),
        CheckConstraint("value IN (-1, 1)", name="ck_pod_review_votes_value"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    review_id = Column(String, ForeignKey("pod_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    value = Column(SmallInteger, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProductReview(Base):
    __tablename__ = "product_reviews"
    __table_args__ = (
        CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="ck_product_reviews_rating_range"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, nullable=False, index=True)
    parent_id = Column(String, ForeignKey("product_reviews.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    author_name = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    rating = Column(SmallInteger, nullable=True)
    depth = Column(SmallInteger, nullable=False, default=0)
    path = Column(Text, nullable=False, index=True)
    upvotes = Column(Integer, nullable=False, default=0)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parent = relationship("ProductReview", remote_side=[id], backref="replies")

    @property
    def score(self) -> int:
        return self.upvotes


class ProductReviewVote(Base):
    __tablename__ = "product_review_votes"
    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="uq_product_review_votes_review_user"),
        CheckConstraint("value IN (-1, 1)", name="ck_product_review_votes_value"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    review_id = Column(String, ForeignKey("product_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    value = Column(SmallInteger, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserCartItem(Base):
    __tablename__ = "user_cart_items"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_user_cart_items_user_product"),
        CheckConstraint("quantity >= 1", name="ck_user_cart_items_quantity_positive"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    image = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BuildingApplicationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    REVIEWING = "reviewing"
    APPROVED = "approved"
    REJECTED = "rejected"


class BuildingApplication(Base):
    __tablename__ = "building_applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)
    user_email = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    building_name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    building_type = Column(String, nullable=False)
    space_size = Column(String, nullable=False)
    additional_info = Column(Text, nullable=True)
    status = Column(Enum(BuildingApplicationStatus), default=BuildingApplicationStatus.SUBMITTED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
