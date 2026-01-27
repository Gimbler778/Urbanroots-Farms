from sqlalchemy.orm import Session
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate
from typing import Optional, List


class ProductService:
    @staticmethod
    def get_product(db: Session, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def get_products(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None
    ) -> List[Product]:
        query = db.query(Product)
        if category:
            query = query.filter(Product.category == category)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def create_product(db: Session, product: ProductCreate) -> Product:
        db_product = Product(**product.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def update_product(
        db: Session,
        product_id: str,
        product: ProductUpdate
    ) -> Optional[Product]:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if db_product:
            update_data = product.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_product, field, value)
            db.commit()
            db.refresh(db_product)
        return db_product
    
    @staticmethod
    def delete_product(db: Session, product_id: str) -> bool:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if db_product:
            db.delete(db_product)
            db.commit()
            return True
        return False
