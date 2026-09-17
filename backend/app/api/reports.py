from fastapi import APIRouter, Body, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime

from sqlalchemy.orm import Session

from ..services.report_service import ReportService
from ..services.scoring_service import ScoringService
from ..database.database import get_db
from ..models.incident import Incident

router = APIRouter()
report_service = ReportService()
scoring_service = ScoringService()


class ReportRequest(BaseModel):
    incident_id: str
    format: str = "pdf"  # "pdf" or "json"


@router.post("/generate")
async def generate_report(request: ReportRequest, db: Session = Depends(get_db)):
    """Generate an investigation report (PDF or JSON)."""
    # Fetch incident
    incident = db.query(Incident).filter(Incident.id == request.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Get vessels for this incident (mock for demo)
    vessels = scoring_service.get_vessels_for_incident(request.incident_id)  # placeholder

    if request.format == "pdf":
        pdf_bytes = report_service.generate_pdf(incident, vessels)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=report_{incident.id}.pdf"}
        )
    elif request.format == "json":
        data = report_service.generate_json(incident, vessels)
        return data
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")


@router.get("/preview/{incident_id}")
async def preview_report(incident_id: str, db: Session = Depends(get_db)):
    """Get a preview of the report data (JSON)."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    vessels = scoring_service.get_vessels_for_incident(incident_id)

    return {
        "incident": {
            "id": incident.id,
            "name": incident.name,
            "status": incident.status,
            "severity": incident.severity,
            "detection_time": incident.detection_time.isoformat(),
            "location_name": incident.location_name,
            "spill_area_km2": incident.spill_area_km2,
            "confidence": incident.confidence,
            "probable_origin_lat": incident.probable_origin_lat,
            "probable_origin_lon": incident.probable_origin_lon,
            "origin_confidence": incident.origin_confidence,
        },
        "vessels": [
            {
                "mmsi": v.mmsi,
                "name": v.name,
                "type": v.type,
                "flag": v.flag,
                "closest_approach_distance_km": v.closest_approach_distance_km,
                "total_association_score": v.total_association_score,
                "association_category": v.association_category,
            }
            for v in vessels[:5]
        ],
        "generated_at": datetime.now().isoformat(),
        "mode": "demo"
    }