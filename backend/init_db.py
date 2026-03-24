"""
Database initialization script with sample data
"""
from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models import Product, User, Session as AuthSession, Account
import uuid


def init_db():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")
    print("✓ Auth tables (user, session, account, verification) created")


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
            "image": "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "vegetables",
            "stock": 50,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Spinach",
            "description": "Nutrient-rich fresh spinach leaves. Great for salads and smoothies.",
            "price": 4.49,
            "image": "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "vegetables",
            "stock": 40,
            "organic": True,
            "unit": "bunch"
        },
        {
            "name": "Organic Strawberries",
            "description": "Sweet and juicy organic strawberries. Freshly picked from local farms.",
            "price": 5.99,
            "image": "https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "fruits",
            "stock": 30,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Blueberries",
            "description": "Antioxidant-rich organic blueberries. Perfect for snacking or baking.",
            "price": 6.99,
            "image": "https://images.pexels.com/photos/70862/blueberries-fruit-blue-berries-70862.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "fruits",
            "stock": 25,
            "organic": True,
            "unit": "pint"
        },
        {
            "name": "Organic Basil",
            "description": "Fresh organic basil with aromatic leaves. Essential for Italian cooking.",
            "price": 2.99,
            "image": "https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "herbs",
            "stock": 60,
            "organic": True,
            "unit": "bunch"
        },
        {
            "name": "Organic Carrots",
            "description": "Sweet and crunchy organic carrots. Perfect for snacking or cooking.",
            "price": 2.49,
            "image": "https://images.pexels.com/photos/65174/pexels-photo-65174.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "vegetables",
            "stock": 80,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Apples",
            "description": "Crisp and sweet organic apples. Great for snacking or baking.",
            "price": 4.99,
            "image": "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "fruits",
            "stock": 70,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Lettuce",
            "description": "Fresh and crispy organic lettuce. Perfect for salads.",
            "price": 3.49,
            "image": "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "vegetables",
            "stock": 45,
            "organic": True,
            "unit": "head"
        },
        {
            "name": "Organic Mint",
            "description": "Refreshing organic mint leaves. Great for teas and garnishing.",
            "price": 2.49,
            "image": "https://images.pexels.com/photos/2305195/pexels-photo-2305195.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "herbs",
            "stock": 55,
            "organic": True,
            "unit": "bunch"
        },
        {
            "name": "Organic Bell Peppers",
            "description": "Colorful organic bell peppers. Sweet and crunchy.",
            "price": 5.49,
            "image": "https://images.pexels.com/photos/5945906/pexels-photo-5945906.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "vegetables",
            "stock": 35,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Bananas",
            "description": "Sweet and creamy organic bananas. Perfect for smoothies or snacking.",
            "price": 1.99,
            "image": "https://images.pexels.com/photos/5945840/pexels-photo-5945840.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
            "category": "fruits",
            "stock": 100,
            "organic": True,
            "unit": "lb"
        },
        {
            "name": "Organic Parsley",
            "description": "Fresh organic parsley. Essential herb for cooking and garnishing.",
            "price": 2.29,
            "image": "https://images.pexels.com/photos/531260/pexels-photo-531260.jpeg?auto=compress&cs=tinysrgb&h=400&w=600",
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
