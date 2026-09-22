from .database.database import engine, Base, SessionLocal
from .models import *  # import all models so tables are registered

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Main] Starting up...")
    
    # ✅ Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("[Main] Database tables ready")
    
    # ✅ Auto-seed if database is empty
    db = SessionLocal()
    try:
        from .models.incident import Incident
        if db.query(Incident).count() == 0:
            print("[Main] Empty DB – seeding historical incidents...")
            from .database.seed_historical import main as seed_main
            seed_main()
            print("[Main] Seed complete")
        else:
            print(f"[Main] DB has {db.query(Incident).count()} incidents")
    finally:
        db.close()
    
    # Start AIS + scheduler
    if config.LIVE_MODE:
        ais_service = AISService()
        asyncio.create_task(ais_service.listen_for_vessels())
        start_scheduler()
        print("[Main] Live mode active")
    else:
        print("[Main] Demo mode")
    
    yield
    print("[Main] Shutting down...")