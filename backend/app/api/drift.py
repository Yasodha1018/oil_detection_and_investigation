from fastapi import APIRouter, Query
from ..services.drift_service import DriftService

router = APIRouter()
drift = DriftService()

@router.get("/conditions")
async def get_drift_conditions(
    lat: float = Query(...),
    lon: float = Query(...)
):
    conditions = drift.get_drift_conditions(lat, lon)
    return conditions