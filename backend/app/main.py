from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime
import traceback

from .api import incidents, satellite, ais, drift, vessels, reports, investigation
from .config import config
from .database.database import engine, Base, SessionLocal
from .models.incident import Incident
from .models.vessel import Vessel
from .models.spill import SpillGeometry
from .models.evidence import Evidence


# ===== WebSocket Manager =====
class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()


# ===== Lifespan =====
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Main] Starting up...")

    # 1. Create tables
    try:
        Base.metadata.create_all(bind=engine)
        print("[Main] Tables created")
    except Exception as e:
        print(f"[Main] Table creation failed: {e}")
        traceback.print_exc()

    # 2. Seed if empty
    db = SessionLocal()
    try:
        count = db.query(Incident).count()
        print(f"[Main] Current incidents: {count}")
        if count == 0:
            print("[Main] Empty DB - running seed...")
            try:
                from .database.seed_historical import seed_single_incident
                from .data.locations import coastalLocations
                target_ids = ["MR-2010-MUMBAI", "MR-2017-ENNORE", "MR-2025-KERALA"]
                for loc in coastalLocations:
                    if loc["id"] in target_ids:
                        seed_single_incident(db, loc)
                print("[Main] Seeding complete")
            except Exception as e:
                print(f"[Main] Seeding failed: {e}")
                traceback.print_exc()
        else:
            print(f"[Main] DB has {count} incidents - skipping seed")
    finally:
        db.close()

    # 3. Live mode
    if config.LIVE_MODE:
        try:
            from .services.ais_service import AISService
            from .scheduler import start_scheduler
            ais_service = AISService()
            asyncio.create_task(ais_service.listen_for_vessels())
            start_scheduler()
            print("[Main] Live mode active")
        except Exception as e:
            print(f"[Main] Live tasks failed: {e}")

    yield
    print("[Main] Shutting down...")


# ===== FastAPI App =====
app = FastAPI(title="MARITRACE API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(satellite.router, prefix="/api/satellite", tags=["Satellite"])
app.include_router(ais.router, prefix="/api/ais", tags=["AIS"])
app.include_router(drift.router, prefix="/api/drift", tags=["Drift"])
app.include_router(vessels.router, prefix="/api/vessels", tags=["Vessels"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(investigation.router, prefix="/api/investigation", tags=["Investigation"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": "live" if config.LIVE_MODE else "demo"}


@app.get("/api/debug/db")
async def debug_db():
    db = SessionLocal()
    try:
        return {
            "incidents": db.query(Incident).count(),
            "vessels": db.query(Vessel).count(),
            "db_url": config.DATABASE_URL,
        }
    finally:
        db.close()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "init", "status": "connected"})
        while True:
            await asyncio.sleep(5)
            await manager.broadcast({"type": "ping", "timestamp": datetime.now().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)