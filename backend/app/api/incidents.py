from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database.database import get_db
from ..models.incident import Incident
from ..services.scoring_service import ScoringService

router = APIRouter()

@router.get("/")
async def get_incidents(
    status: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all incidents, optionally filtered by status."""
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    incidents = query.limit(limit).all()
    return [
        {
            "id": inc.id,
            "name": inc.name,
            "status": inc.status,
            "severity": inc.severity,
            "detection_time": inc.detection_time.isoformat(),
            "location_name": inc.location_name,
            "spill_area_km2": inc.spill_area_km2,
            "confidence": inc.confidence,
            "candidate_vessels_count": inc.candidate_vessels_count
        }
        for inc in incidents
    ]

@router.get("/{incident_id}")
async def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get a single incident by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {
        "id": incident.id,
        "name": incident.name,
        "status": incident.status,
        "severity": incident.severity,
        "detection_time": incident.detection_time.isoformat(),
        "satellite_platform": incident.satellite_platform,
        "sensor": incident.sensor,
        "resolution_meters": incident.resolution_meters,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "location_name": incident.location_name,
        "spill_area_km2": incident.spill_area_km2,
        "spill_length_km": incident.spill_length_km,
        "spill_max_width_km": incident.spill_max_width_km,
        "orientation": incident.orientation,
        "confidence": incident.confidence,
        "oil_probability": incident.oil_probability,
        "lookalike_probability": incident.lookalike_probability,
        "no_oil_probability": incident.no_oil_probability,
        "probable_origin_lat": incident.probable_origin_lat,
        "probable_origin_lon": incident.probable_origin_lon,
        "origin_confidence": incident.origin_confidence,
        "estimated_spill_time": incident.estimated_spill_time.isoformat() if incident.estimated_spill_time else None,
        "candidate_vessels_count": incident.candidate_vessels_count
    }

@router.post("/")
async def create_incident(incident_data: dict, db: Session = Depends(get_db)):
    """Create a new incident (demo)."""
    # In production, this would validate and create from request body
    new_incident = Incident(
        id=incident_data.get("id", f"MR-{datetime.now().strftime('%Y%m%d-%H%M')}"),
        name=incident_data.get("name", "New Spill Event"),
        status="UNDER_INVESTIGATION",
        severity=incident_data.get("severity", "MEDIUM"),
        detection_time=datetime.now(),
        satellite_platform=incident_data.get("satellite_platform", "Sentinel-1B"),
        sensor=incident_data.get("sensor", "C-Band IW"),
        resolution_meters=incident_data.get("resolution_meters", 10),
        latitude=incident_data.get("latitude", 0.0),
        longitude=incident_data.get("longitude", 0.0),
        location_name=incident_data.get("location_name", "Unknown"),
        spill_area_km2=incident_data.get("spill_area_km2", 0.0),
        spill_length_km=incident_data.get("spill_length_km", 0.0),
        spill_max_width_km=incident_data.get("spill_max_width_km", 0.0),
        orientation=incident_data.get("orientation", ""),
        confidence=incident_data.get("confidence", 0.0),
        oil_probability=incident_data.get("oil_probability", 0.0),
        lookalike_probability=incident_data.get("lookalike_probability", 0.0),
        no_oil_probability=incident_data.get("no_oil_probability", 0.0),
        probable_origin_lat=incident_data.get("probable_origin_lat", 0.0),
        probable_origin_lon=incident_data.get("probable_origin_lon", 0.0),
        origin_confidence=incident_data.get("origin_confidence", 0.0),
        estimated_spill_time=datetime.now(),
        candidate_vessels_count=0
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return {"id": new_incident.id, "status": "created"}