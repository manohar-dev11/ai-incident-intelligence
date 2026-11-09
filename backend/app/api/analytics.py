from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.incident import Incident
from app.schemas.analytics import IncidentAnalytics

router = APIRouter(prefix="/analytics", tags=["Incident Analytics"])

@router.get("/summary", response_model=IncidentAnalytics)
def get_incident_analytics(db: Session = Depends(get_db)):

    total = db.query(Incident).count()

    open_count = db.query(Incident).filter(
        Incident.status == "open"
    ).count()

    investigating_count = db.query(Incident).filter(
        Incident.status == "investigating"
    ).count()

    resolved_count = db.query(Incident).filter(
        Incident.status == "resolved"
    ).count()

    critical_count = db.query(Incident).filter(
        Incident.severity == "critical"
    ).count()

    high_count = db.query(Incident).filter(
        Incident.severity == "high"
    ).count()

    medium_count = db.query(Incident).filter(
        Incident.severity == "medium"
    ).count()

    low_count = db.query(Incident).filter(
        Incident.severity == "low"
    ).count()

    return {
        "total_incidents": total,
        "open_incidents": open_count,
        "investigating_incidents": investigating_count,
        "resolved_incidents": resolved_count,
        "critical_incidents": critical_count,
        "high_incidents": high_count,
        "medium_incidents": medium_count,
        "low_incidents": low_count
    }