from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..models.incident import Incident
from ..models.vessel import Vessel
from ..services.investigation_service import InvestigationService

router = APIRouter()
investigation_service = InvestigationService()

@router.get("/{incident_id}")
async def get_investigation(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    vessels = db.query(Vessel).filter(Vessel.incident_id == incident_id).all()
    result = investigation_service.run_investigation(incident, vessels)
    return result