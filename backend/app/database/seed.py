"""
Seed the database with demo data for MARITRACE.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.incident import Incident, IncidentStatus, Severity
from ..models.vessel import Vessel
from ..models.spill import SpillGeometry
from ..models.evidence import Evidence
from .database import SessionLocal, engine, Base

def seed_data(db: Session):
    """Populate database with sample incident and vessel data."""

    # Check if already seeded
    if db.query(Incident).first():
        print("Database already seeded. Skipping...")
        return

    print("Seeding database...")

    # Create incident
    incident = Incident(
        id="MR-2026-0147",
        name="Arabian Sea Corridor Spill Event",
        status=IncidentStatus.UNDER_INVESTIGATION,
        severity=Severity.HIGH,
        detection_time=datetime(2026, 9, 14, 14, 20),
        satellite_platform="Sentinel-1B SAR (Synthetic Aperture Radar)",
        sensor="C-Band Interferometric Wide Swath (IW)",
        resolution_meters=10,
        latitude=18.718,
        longitude=72.934,
        location_name="Mumbai Offshore Shipping Channel, Arabian Sea (EEZ Zone)",
        spill_area_km2=42.7,
        spill_length_km=14.8,
        spill_max_width_km=4.2,
        orientation="NE → SW (234°)",
        confidence=94.2,
        oil_probability=94.2,
        lookalike_probability=3.8,
        no_oil_probability=2.0,
        probable_origin_lat=18.642,
        probable_origin_lon=72.841,
        origin_confidence=87.4,
        estimated_spill_time=datetime(2026, 9, 14, 11, 45),
        candidate_vessels_count=7
    )
    db.add(incident)
    db.flush()  # get incident.id

    # Create vessels
    vessels_data = [
        {
            "mmsi": "123456789",
            "name": "MV Ocean Star",
            "type": "Crude Oil Tanker",
            "flag": "Panama (PA)",
            "call_sign": "3E2910",
            "length_meters": 180.0,
            "beam_meters": 32.0,
            "current_lat": 18.520,
            "current_lon": 72.690,
            "speed_knots": 11.4,
            "course_deg": 238.0,
            "heading_deg": 236.0,
            "first_seen": "14:32 UTC",
            "last_seen": "19:48 UTC",
            "closest_approach_distance_km": 8.2,
            "closest_approach_time": "11:42 UTC",
            "proximity_score": 94.0,
            "time_score": 96.0,
            "trajectory_score": 91.0,
            "drift_score": 87.0,
            "anomaly_score": 74.0,
            "total_association_score": 91.0,
            "association_category": "High Association",
            "is_candidate": True,
            "trajectory": [
                {"lat": 18.820, "lon": 73.010, "timestamp": "2026-09-14T10:00:00Z", "speed": 12.8},
                {"lat": 18.730, "lon": 72.920, "timestamp": "2026-09-14T11:15:00Z", "speed": 12.1},
                {"lat": 18.665, "lon": 72.855, "timestamp": "2026-09-14T11:42:00Z", "speed": 9.6},
                {"lat": 18.590, "lon": 72.770, "timestamp": "2026-09-14T12:50:00Z", "speed": 11.2},
                {"lat": 18.520, "lon": 72.690, "timestamp": "2026-09-14T14:30:00Z", "speed": 11.4}
            ],
            "evidence_items": [
                "Passed within 8.2 km of reconstructed spill origin",
                "Timing directly overlaps backward hindcast release window",
                "Historical AIS trajectory bisects the primary drift envelope",
                "Vessel course alignment matches slick orientation",
                "Temporary speed deceleration of 3.2 knots recorded"
            ],
            "anomalies_detected": [
                "Moderate speed fluctuation at 11:42 UTC",
                "Engine load signature variance"
            ]
        },
        # Add more vessels similarly (simplified for brevity)
        # For production, you'd seed all 7 candidates and 3 non-candidates.
    ]

    for vdata in vessels_data:
        vessel = Vessel(
            mmsi=vdata["mmsi"],
            name=vdata["name"],
            type=vdata["type"],
            flag=vdata["flag"],
            call_sign=vdata["call_sign"],
            length_meters=vdata["length_meters"],
            beam_meters=vdata["beam_meters"],
            current_lat=vdata["current_lat"],
            current_lon=vdata["current_lon"],
            speed_knots=vdata["speed_knots"],
            course_deg=vdata["course_deg"],
            heading_deg=vdata["heading_deg"],
            first_seen=vdata["first_seen"],
            last_seen=vdata["last_seen"],
            closest_approach_distance_km=vdata["closest_approach_distance_km"],
            closest_approach_time=vdata["closest_approach_time"],
            proximity_score=vdata["proximity_score"],
            time_score=vdata["time_score"],
            trajectory_score=vdata["trajectory_score"],
            drift_score=vdata["drift_score"],
            anomaly_score=vdata["anomaly_score"],
            total_association_score=vdata["total_association_score"],
            association_category=vdata["association_category"],
            is_candidate=vdata["is_candidate"],
            trajectory=vdata["trajectory"],
            evidence_items=vdata["evidence_items"],
            anomalies_detected=vdata["anomalies_detected"],
            incident_id=incident.id
        )
        db.add(vessel)

    # Add spill geometry
    geometry = SpillGeometry(
        incident_id=incident.id,
        geometry_type="Polygon",
        coordinates=[
            [18.750, 72.965],
            [18.742, 72.975],
            [18.725, 72.955],
            [18.705, 72.930],
            [18.685, 72.905],
            [18.692, 72.890],
            [18.715, 72.915],
            [18.735, 72.945]
        ],
        area_km2=42.7,
        perimeter_km=38.6,
        centroid_lat=18.718,
        centroid_lon=72.934,
        confidence=94.2,
        detection_time=datetime(2026, 9, 14, 14, 20),
        source="AI"
    )
    db.add(geometry)

    # Add evidence records (optional)
    evidence_items = [
        {
            "type": "satellite",
            "title": "SAR Detection",
            "description": "Sentinel-1B IW detected dark anomaly classified as oil slick with 94.2% confidence.",
            "confidence": 94.2,
            "source": "Sentinel-1B"
        },
        {
            "type": "drift",
            "title": "Drift Hindcast",
            "description": "Backward Lagrangian integration localized origin at 18.642°N, 72.841°E.",
            "confidence": 87.4,
            "source": "INCOIS/ECMWF"
        }
    ]
    for edata in evidence_items:
        evidence = Evidence(
            incident_id=incident.id,
            evidence_type=edata["type"],
            title=edata["title"],
            description=edata["description"],
            confidence=edata["confidence"],
            source=edata["source"],
            timestamp=datetime.now()
        )
        db.add(evidence)

    db.commit()
    print("Database seeding complete!")

def main():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()