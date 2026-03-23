from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, ensure_runtime_schema
from app.api.routes import auth, products, orders
from app.api.routes import applications
from app.api.routes import pod_rentals
from app.api.routes import pod_reviews
from app.api.routes import admin
from app.api.routes import farmbot
from app.api.routes import product_reviews
from app.api.routes import cart

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    ensure_runtime_schema()
    yield
    # Shutdown (if needed)
    # Add cleanup code here

app = FastAPI(
    title="UrbanRoots API",
    description="API for UrbanRoots platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(applications.router, prefix="/api", tags=["applications"])
app.include_router(pod_rentals.router, prefix="/api", tags=["pod-rentals"])
app.include_router(pod_reviews.router, prefix="/api", tags=["pod-reviews"])
app.include_router(product_reviews.router, prefix="/api", tags=["product-reviews"])
app.include_router(cart.router, prefix="/api", tags=["cart"])
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(farmbot.router, prefix="/api", tags=["farmbot"])

@app.get("/")
async def root():
    return {"message": "Welcome to UrbanRoots API"}
