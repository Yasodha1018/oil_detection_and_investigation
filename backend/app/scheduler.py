from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import datetime
from .services.satellite_service import SatelliteService
from .services.ais_service import AISService
from .ml.detector import OilSpillDetector
from .database.database import SessionLocal
from .models.incident import Incident, IncidentStatus
from .models.vessel import Vessel
from .utils.websocket_manager import manager  # we'll create this

scheduler = BackgroundScheduler()

def check_for_new_spills():
    """Periodically check for new oil spills from recent satellite data."""
    sat_service = SatelliteService()
    detector = OilSpillDetector()
    db = SessionLocal()
    try:
        # For each area of interest (e.g., all coastal locations), fetch scenes
        areas = [
            {"lat": 18.718, "lon": 72.934},  # Mumbai
            {"lat": 15.490, "lon": 73.818},  # Goa
            {"lat": 9.931, "lon": 76.267},   # Kochi
            # ... all 10 locations
        ]
        for area in areas:
            scenes = sat_service.search_recent_scenes(area["lat"], area["lon"], days_back=1)
            for scene in scenes:
                # Download and run detection
                result = detector.analyze(scene["download_url"])
                if result["confidence"] > 70:  # threshold
                    # Create incident
                    incident = Incident(
                        id=f"MR-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                        name=f"Spill detected at {area['lat']}, {area['lon']}",
                        status=IncidentStatus.UNDER_INVESTIGATION,
                        severity="HIGH",
                        detection_time=datetime.now(),
                        satellite_platform=scene["satellite"],
                        latitude=area["lat"],
                        longitude=area["lon"],
                        spill_area_km2=result["area_km2"],
                        confidence=result["confidence"],
                        oil_probability=result["oil_probability"],
                        probable_origin_lat=area["lat"],
                        probable_origin_lon=area["lon"],
                        origin_confidence=result["confidence"],
                    )
                    db.add(incident)
                    db.commit()
                    # Broadcast to frontend via WebSocket
                    manager.broadcast({
                        "type": "new_spill",
                        "incident": {
                            "id": incident.id,
                            "location": [area["lat"], area["lon"]],
                            "area": result["area_km2"],
                            "confidence": result["confidence"]
                        }
                    })
    finally:
        db.close()

def update_vessel_positions():
    """Periodically update vessel positions from AIS."""
    ais_service = AISService()
    db = SessionLocal()
    try:
        # For each active incident area, fetch vessels
        incidents = db.query(Incident).filter(Incident.status != "RESOLVED").all()
        for inc in incidents:
            vessels = ais_service.get_nearby_vessels(inc.latitude, inc.longitude, 50)
            for v in vessels:
                # Update or create vessel record
                vessel = db.query(Vessel).filter(Vessel.mmsi == v["mmsi"]).first()
                if vessel:
                    vessel.current_lat = v["lat"]
                    vessel.current_lon = v["lon"]
                    vessel.speed_knots = v["speed"]
                    vessel.course_deg = v["course"]
                else:
                    vessel = Vessel(
                        mmsi=v["mmsi"],
                        name=v["name"],
                        type=v["type"],
                        flag=v["flag"],
                        current_lat=v["lat"],
                        current_lon=v["lon"],
                        speed_knots=v["speed"],
                        course_deg=v["course"],
                        incident_id=inc.id
                    )
                    db.add(vessel)
                db.commit()
                # Broadcast vessel update
                manager.broadcast({
                    "type": "vessel_update",
                    "mmsi": v["mmsi"],
                    "lat": v["lat"],
                    "lon": v["lon"],
                    "speed": v["speed"]
                })
    finally:
        db.close()

# Start scheduler when app starts
def start_scheduler():
    scheduler.add_job(check_for_new_spills, 'interval', minutes=30)  # every 30 min
    scheduler.add_job(update_vessel_positions, 'interval', minutes=2)   # every 2 min
    scheduler.start()