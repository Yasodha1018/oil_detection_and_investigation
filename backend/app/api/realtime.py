from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def realtime_status():
    return {"status": "ok", "mode": "realtime"}