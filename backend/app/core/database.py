from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_runtime_schema() -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    if "orders" in table_names:
        order_columns = {column["name"] for column in inspector.get_columns("orders")}
        if "user_id" not in order_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE orders ADD COLUMN user_id VARCHAR"))

    if "user" in table_names:
        user_columns = {column["name"] for column in inspector.get_columns("user")}
        if "role" not in user_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE \"user\" ADD COLUMN role VARCHAR DEFAULT 'user'"))

        if settings.admin_email:
            with engine.begin() as connection:
                connection.execute(
                    text("UPDATE \"user\" SET role = 'admin' WHERE lower(email) = lower(:admin_email)"),
                    {"admin_email": settings.admin_email},
                )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
