from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import products, orders, auth

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to UrbanRoots API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
