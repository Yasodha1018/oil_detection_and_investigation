from fastapi import APIRouter, File, UploadFile, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import tempfile
import os
import csv
import json

from ..services.ais_service import AISService
from ..services.scoring_service import ScoringService
from ..database.database import get_db

router = APIRouter()
ais_service = AISService()
scoring_service = ScoringService()


@router.post("/upload")
async def upload_ais(file: UploadFile = File(...)):
    """Upload a CSV or JSON file containing AIS data."""
    if file.filename.endswith('.csv'):
        content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        ais_service.load_from_csv(tmp_path)
        os.unlink(tmp_path)
        return {"vessels_loaded": len(ais_service.vessels), "mode": "demo"}
    elif file.filename.endswith('.json'):
        content = await file.read()
        data = json.loads(content.decode())
        ais_service.load_from_json(data)
        return {"vessels_loaded": len(ais_service.vessels), "mode": "demo"}
    else:
        raise HTTPException(status_code=400, detail="Only CSV or JSON files are supported")


@router.get("/vessels")
async def get_vessels(
    incident_id: Optional[str] = Query(None),
    candidate_only: bool = Query(False),
    db: Session = Depends(get_db)  # Now Depends is defined
):
    """Get all AIS vessels (optionally for a specific incident)."""
    vessels = ais_service.get_vessels()
    if candidate_only:
        vessels = [v for v in vessels if v.get("is_candidate", False)]
    return vessels


@router.get("/vessels/{mmsi}")
async def get_vessel_by_mmsi(mmsi: str):
    """Get a single vessel by MMSI."""
    vessel = ais_service.get_vessel_by_mmsi(mmsi)
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel


@router.post("/filter")
async def filter_candidates(
    origin_lat: float = Query(...),
    origin_lon: float = Query(...),
    origin_time: str = Query(...),
    radius_km: float = Query(50),
    time_window_hours: int = Query(24)
):
    """Filter candidate vessels based on spatio-temporal criteria."""
    from datetime import datetime
    origin_dt = datetime.fromisoformat(origin_time.replace('Z', '+00:00'))
    candidates = ais_service.filter_candidates(
        origin_lat, origin_lon, origin_dt, radius_km, time_window_hours
    )
    return {
        "candidates": candidates,
        "count": len(candidates)
    }