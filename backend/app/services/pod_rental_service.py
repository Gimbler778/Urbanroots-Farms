from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.models import PodRental
from app.schemas import PodRentalCreate


POD_PLAN_CATALOG: Dict[str, Dict[str, object]] = {
    "starter": {
        "pod_name": "Starter Pod",
        "pod_size": "small",
        "monthly_price": 2499.0,
        "installation_fee": 5000.0,
    },
    "standard": {
        "pod_name": "Standard Pod",
        "pod_size": "medium",
        "monthly_price": 4999.0,
        "installation_fee": 5000.0,
    },
    "premium": {
        "pod_name": "Premium Pod",
        "pod_size": "large",
        "monthly_price": 8999.0,
        "installation_fee": 5000.0,
    },
}


class PodRentalService:
    @staticmethod
    def get_plan(plan_id: str) -> Optional[Dict[str, object]]:
        return POD_PLAN_CATALOG.get(plan_id)

    @staticmethod
    def create_pod_rental(db: Session, user_id: str, payload: PodRentalCreate) -> PodRental:
        plan = PodRentalService.get_plan(payload.pod_plan_id)
        if not plan:
            raise ValueError("Selected pod plan is invalid")

        rental = PodRental(
            user_id=user_id,
            pod_plan_id=payload.pod_plan_id,
            pod_name=str(plan["pod_name"]),
            pod_size=str(plan["pod_size"]),
            monthly_price=float(plan["monthly_price"]),
            installation_fee=float(plan["installation_fee"]),
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            installation_address=payload.installation_address,
            city=payload.city,
            state=payload.state,
            zip_code=payload.zip_code,
            preferred_start_date=payload.preferred_start_date.isoformat(),
            rental_term_months=payload.rental_term_months,
            building_name=payload.building_name,
            location_type=payload.location_type,
            growing_goals=payload.growing_goals,
            notes=payload.notes,
            terms_accepted=payload.terms_accepted,
        )
        db.add(rental)
        db.commit()
        db.refresh(rental)
        return rental
