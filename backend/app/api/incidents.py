from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentUpdate, IncidentCreate, IncidentResponse

router = APIRouter(
    prefix="/incidents",
    tags=["Incident Management"]
)

@router.post(
    "/",
    response_model=IncidentResponse,
    status_code = status.HTTP_201_CREATED
)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db)
):
    new_incident = Incident(**incident_data.model_dump())

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident

@router.get("/", response_model=list[IncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    return (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return incident

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    update_data = incident_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)

    return incident

@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    db.delete(incident)
    db.commit()

    return {
        "message": "Incident deleted successfully",
        "incident_id": incident_id
    }



