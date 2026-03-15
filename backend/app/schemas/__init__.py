from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Dict, Optional, List
from enum import Enum


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
    installation_address: str
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
    installation_address: str
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
