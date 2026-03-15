from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_admin
from app.core.database import get_db
from app.models import BuildingApplication, PodRental, Product, User
from app.schemas import (
    BuildingApplication as BuildingApplicationSchema,
    BuildingApplicationStatusUpdate,
    PodRental as PodRentalSchema,
    PodRentalStatusUpdate,
    Product as ProductSchema,
    ProductCreate,
    ProductUpdate,
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    products = db.query(Product).all()
    pod_rentals = db.query(PodRental).order_by(PodRental.created_at.desc()).all()
    building_applications = db.query(BuildingApplication).order_by(BuildingApplication.created_at.desc()).all()

    return {
        "metrics": {
            "products": len(products),
            "pod_rentals": len(pod_rentals),
            "building_applications": len(building_applications),
            "pending_pod_rentals": sum(1 for row in pod_rentals if row.status.value == "requested"),
            "pending_applications": sum(1 for row in building_applications if row.status.value == "submitted"),
        },
        "products": products,
        "pod_rentals": pod_rentals,
        "building_applications": building_applications,
    }


@router.get("/products", response_model=list[ProductSchema])
def get_admin_products(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(Product).all()


@router.post("/products", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
def create_admin_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return ProductService.create_product(db, payload)


@router.put("/products/{product_id}", response_model=ProductSchema)
def update_admin_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    updated = ProductService.update_product(db, product_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_product(
    product_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    if not ProductService.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")


@router.get("/pod-rentals", response_model=list[PodRentalSchema])
def get_admin_pod_rentals(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(PodRental).order_by(PodRental.created_at.desc()).all()


@router.patch("/pod-rentals/{rental_id}", response_model=PodRentalSchema)
def update_admin_pod_rental_status(
    rental_id: str,
    payload: PodRentalStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    rental = db.query(PodRental).filter(PodRental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Pod rental not found")

    rental.status = payload.status
    db.commit()
    db.refresh(rental)
    return rental


@router.get("/building-applications", response_model=list[BuildingApplicationSchema])
def get_admin_building_applications(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(BuildingApplication).order_by(BuildingApplication.created_at.desc()).all()


@router.patch("/building-applications/{application_id}", response_model=BuildingApplicationSchema)
def update_admin_building_application_status(
    application_id: str,
    payload: BuildingApplicationStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    application = db.query(BuildingApplication).filter(BuildingApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Building application not found")

    application.status = payload.status
    db.commit()
    db.refresh(application)
    return application
