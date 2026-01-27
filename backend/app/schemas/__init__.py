from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


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
