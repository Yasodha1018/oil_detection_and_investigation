from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database.database import get_db
from ..models.vessel import Vessel
from ..models.incident import Incident

router = APIRouter()

@router.get("/")
async def get_vessels(
    incident_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Return vessels, optionally filtered by incident_id."""
    query = db.query(Vessel)
    if incident_id:
        # Check incident exists
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
        query = query.filter(Vessel.incident_id == incident_id)
    vessels = query.all()
    return [
        {
            "mmsi": v.mmsi,
            "name": v.name,
            "type": v.type,
            "flag": v.flag,
            "callSign": v.call_sign,
            "lengthMeters": v.length_meters,
            "beamMeters": v.beam_meters,
            "currentLat": v.current_lat,
            "currentLon": v.current_lon,
            "speedKnots": v.speed_knots,
            "courseDeg": v.course_deg,
            "headingDeg": v.heading_deg,
            "firstSeen": v.first_seen,
            "lastSeen": v.last_seen,
            "closestApproachDistanceKm": v.closest_approach_distance_km,
            "closestApproachTime": v.closest_approach_time,
            "proximityScore": v.proximity_score,
            "timeScore": v.time_score,
            "trajectoryScore": v.trajectory_score,
            "driftScore": v.drift_score,
            "anomalyScore": v.anomaly_score,
            "totalAssociationScore": v.total_association_score,
            "associationCategory": v.association_category,
            "isCandidate": v.is_candidate,
            "trajectory": v.trajectory,
            "evidenceItems": v.evidence_items,
            "anomaliesDetected": v.anomalies_detected,
        }
        for v in vessels
    ]