from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas import Product, ProductCreate, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[Product])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional category filter"""
    products = ProductService.get_products(db, skip=skip, limit=limit, category=category)
    return products


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=Product, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    return ProductService.create_product(db, product)


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product"""
    updated_product = ProductService.update_product(db, product_id, product)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    """Delete a product"""
    success = ProductService.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
