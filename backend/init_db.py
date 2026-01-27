"""
Database initialization script with sample data
"""
from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models import Product
import uuid


def init_db():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def seed_data():
    """Seed the database with sample products"""
    db: Session = SessionLocal()
    
    # Check if products already exist
    existing_products = db.query(Product).first()
    if existing_products:
        print("⚠ Database already contains products. Skipping seed.")
        db.close()
        return
    
    sample_products = [
        {
            "name": "Organic Tomatoes",
            "description": "Fresh, vine-ripened organic tomatoes. Perfect for salads, sandwiches, or cooking.",
            "price": 3.99,
            "image": "https://images.unsplash.com/photo-1546470427-e26264be0b93?w=400",
            "category": "vegetables",
            "stock": 50,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Spinach",
            "description": "Nutrient-rich fresh spinach leaves. Great for salads and smoothies.",
            "price": 4.49,
            "image": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
            "category": "vegetables",
            "stock": 40,
            "organic": True,
            "unit": "bunch"
        },
        {
            "name": "Organic Strawberries",
            "description": "Sweet and juicy organic strawberries. Freshly picked from local farms.",
            "price": 5.99,
            "image": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
            "category": "fruits",
            "stock": 30,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Blueberries",
            "description": "Antioxidant-rich organic blueberries. Perfect for snacking or baking.",
            "price": 6.99,
            "image": "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400",
            "category": "fruits",
            "stock": 25,
            "organic": True,
            "unit": "pint"
        },
        {
            "name": "Organic Basil",
            "description": "Fresh organic basil with aromatic leaves. Essential for Italian cooking.",
            "price": 2.99,
            "image": "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400",
            "category": "herbs",
            "stock": 60,
            "organic": True,
            "unit": "bunch"
        },
        {
            "name": "Organic Carrots",
            "description": "Sweet and crunchy organic carrots. Perfect for snacking or cooking.",
            "price": 2.49,
            "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
            "category": "vegetables",
            "stock": 80,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Apples",
            "description": "Crisp and sweet organic apples. Great for snacking or baking.",
            "price": 4.99,
            "image": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400",
            "category": "fruits",
            "stock": 70,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Lettuce",
            "description": "Fresh and crispy organic lettuce. Perfect for salads.",
            "price": 3.49,
            "image": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400",
            "category": "vegetables",
            "stock": 45,
            "organic": True,
            "unit": "head"
        },
        {
            "name": "Organic Mint",
            "description": "Refreshing organic mint leaves. Great for teas and garnishing.",
            "price": 2.49,
            "image": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400",
            "category": "herbs",
            "stock": 55,
            "organic": True,
            "unit": "bunch"
        },
        {
            "name": "Organic Bell Peppers",
            "description": "Colorful organic bell peppers. Sweet and crunchy.",
            "price": 5.49,
            "image": "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400",
            "category": "vegetables",
            "stock": 35,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Bananas",
            "description": "Sweet and creamy organic bananas. Perfect for smoothies or snacking.",
            "price": 1.99,
            "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
            "category": "fruits",
            "stock": 100,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Parsley",
            "description": "Fresh organic parsley. Essential herb for cooking and garnishing.",
            "price": 2.29,
            "image": "https://images.unsplash.com/photo-1557401622-c4e761081d90?w=400",
            "category": "herbs",
            "stock": 65,
            "organic": True,
            "unit": "bunch"
        }
    ]
    
    for product_data in sample_products:
        product = Product(
            id=str(uuid.uuid4()),
            **product_data
        )
        db.add(product)
    
    db.commit()
    print(f"✓ Added {len(sample_products)} sample products to the database")
    db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    seed_data()
    print("✓ Database initialization complete!")
