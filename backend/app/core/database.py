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

        if settings.bootstrap_admin_on_startup and settings.bootstrap_admin_email:
            with engine.begin() as connection:
                connection.execute(
                    text("UPDATE \"user\" SET role = 'admin' WHERE lower(email) = lower(:admin_email)"),
                    {"admin_email": settings.bootstrap_admin_email},
                )

    if "pod_rentals" in table_names:
        pod_columns = {column["name"] for column in inspector.get_columns("pod_rentals")}
        with engine.begin() as connection:
            if "street_name" not in pod_columns:
                connection.execute(text("ALTER TABLE pod_rentals ADD COLUMN street_name VARCHAR DEFAULT ''"))
            if "house_number" not in pod_columns:
                connection.execute(text("ALTER TABLE pod_rentals ADD COLUMN house_number VARCHAR DEFAULT ''"))

            if "installation_address" in pod_columns:
                connection.execute(
                    text(
                        "UPDATE pod_rentals "
                        "SET street_name = COALESCE(NULLIF(street_name, ''), installation_address), "
                        "house_number = COALESCE(NULLIF(house_number, ''), '-')"
                    )
                )

            if engine.dialect.name == "postgresql":
                connection.execute(text("ALTER TYPE podrentalstatus ADD VALUE IF NOT EXISTS 'refund_pending'"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
