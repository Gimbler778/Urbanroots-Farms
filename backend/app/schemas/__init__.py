from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import date, datetime
from typing import Dict, Optional, List
from enum import Enum
import re


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PodRentalStatus(str, Enum):
    REQUESTED = "requested"
    CONTACT_SCHEDULED = "contact_scheduled"
    RENTING = "renting"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUND_PENDING = "refund_pending"


class BuildingApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    REVIEWING = "reviewing"
    APPROVED = "approved"
    REJECTED = "rejected"


# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float = Field(gt=0)
    image: str
    category: str
    stock: int = Field(ge=0)
    organic: bool = True
    unit: str = "lb"


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    organic: Optional[bool] = None
    unit: Optional[str] = None


class Product(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Address Schema
class Address(BaseModel):
    full_name: str
    street: str
    city: str
    state: str
    zip_code: str
    country: str
    phone: str


# Order Item Schemas
class OrderItemBase(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: str
    order_id: str
    product: Product

    class Config:
        from_attributes = True


# Order Schemas
class OrderBase(BaseModel):
    total: float = Field(gt=0)
    status: OrderStatus = OrderStatus.PENDING


class OrderCreate(BaseModel):
    items: List[dict]
    shipping_address: Address


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None


class Order(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime
    full_name: str
    street: str
    city: str
    state: str
    zip_code: str
    country: str
    phone: str
    items: List[OrderItem] = []

    class Config:
        from_attributes = True


class PodRentalCreate(BaseModel):
    pod_plan_id: str
    full_name: str
    email: str
    phone: str
    street_name: str
    house_number: str
    city: str
    state: str
    zip_code: str
    preferred_start_date: date
    rental_term_months: int = Field(ge=1, le=36)
    building_name: Optional[str] = None
    location_type: str
    growing_goals: Optional[str] = None
    notes: Optional[str] = None
    terms_accepted: bool

    @field_validator('phone')
    def validate_phone(cls, v):
        # Accept common phone formats
        if not re.match(r'^[\d\-\+\(\)\s]{10,}$', v):
            raise ValueError('Phone must be at least 10 digits')
        return v

    @field_validator('zip_code')
    def validate_zip(cls, v):
        # Simple zip code validation
        if not re.match(r'^\d{5,6}$', v):
            raise ValueError('Zip code must be 5-6 digits')
        return v


class PodRental(BaseModel):
    id: str
    user_id: str
    pod_plan_id: str
    pod_name: str
    pod_size: str
    monthly_price: float
    installation_fee: float
    status: PodRentalStatus
    full_name: str
    email: str
    phone: str
    street_name: str
    house_number: str
    city: str
    state: str
    zip_code: str
    preferred_start_date: str
    rental_term_months: int
    building_name: Optional[str] = None
    location_type: str
    growing_goals: Optional[str] = None
    notes: Optional[str] = None
    terms_accepted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PodRentalResponse(BaseModel):
    rental: PodRental
    email_delivered: bool
    message: str


class PodRentalStatusUpdate(BaseModel):
    status: PodRentalStatus


class PodReviewCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)
    rating: int = Field(ge=1, le=5)


class PodReviewReplyCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class PodReview(BaseModel):
    id: str
    pod_plan_id: str
    parent_id: Optional[str] = None
    user_id: str
    author_name: str
    body: str
    rating: Optional[int] = None
    depth: int
    path: str
    upvotes: int
    score: int
    is_deleted: bool
    user_vote: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PodReviewListResponse(BaseModel):
    reviews: List[PodReview]
    page: int
    page_size: int
    total_top_level: int
    has_next: bool
    sort: str


class PodReviewVoteUpdate(BaseModel):
    value: int = Field(ge=-1, le=1)


class ProductReviewCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)
    rating: int = Field(ge=1, le=5)


class ProductReviewReplyCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class ProductReview(BaseModel):
    id: str
    product_id: str
    parent_id: Optional[str] = None
    user_id: str
    author_name: str
    body: str
    rating: Optional[int] = None
    depth: int
    path: str
    upvotes: int
    score: int
    is_deleted: bool
    user_vote: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductReviewListResponse(BaseModel):
    reviews: List[ProductReview]
    page: int
    page_size: int
    total_top_level: int
    has_next: bool
    sort: str


class ProductReviewVoteUpdate(BaseModel):
    value: int = Field(ge=-1, le=1)


class UserCartItemPayload(BaseModel):
    product_id: str
    name: str
    category: str
    price: float = Field(gt=0)
    description: str
    image: str
    quantity: int = Field(ge=1)


class UserCartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class UserCartItem(BaseModel):
    id: str
    user_id: str
    product_id: str
    name: str
    category: str
    price: float
    description: str
    image: str
    quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderHistoryItem(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str
    status: str
    created_at: datetime
    total: Optional[float] = None
    monthly_price: Optional[float] = None
    installation_fee: Optional[float] = None
    pod_size: Optional[str] = None
    preferred_start_date: Optional[str] = None
    rental_term_months: Optional[int] = None
    item_count: Optional[int] = None
    details: Dict[str, str]


class BuildingApplicationCreate(BaseModel):
    full_name: str
    phone: str
    building_name: str
    address: str
    building_type: str
    space_size: str
    additional_info: Optional[str] = None


class BuildingApplication(BaseModel):
    id: str
    user_id: str
    user_email: str
    full_name: str
    phone: str
    building_name: str
    address: str
    building_type: str
    space_size: str
    additional_info: Optional[str] = None
    status: BuildingApplicationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BuildingApplicationStatusUpdate(BaseModel):
    status: BuildingApplicationStatus
