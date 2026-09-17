import os
import sys
import random
import math
import re
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database.database import SessionLocal, engine, Base
from backend.app.models.incident import Incident, IncidentStatus, Severity
from backend.app.models.vessel import Vessel
from backend.app.models.spill import SpillGeometry
from backend.app.models.evidence import Evidence
from backend.app.data.locations import coastalLocations

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def extract_angle(orientation_str):
    """Extract angle from orientation string like 'NE → SW (230°)', return int."""
    if not orientation_str:
        return 225
    match = re.search(r'\((\d+)°\)', orientation_str)
    if match:
        return int(match.group(1))
    # Fallback: try to find any number
    numbers = re.findall(r'\d+', orientation_str)
    if numbers:
        return int(numbers[0])
    return 225

def generate_trajectory(origin_lat, origin_lon, origin_time, course_deg, speed_knots, num_points=12):
    trajectory = []
    for i in range(num_points):
        time_offset_minutes = -45 + (i / (num_points - 1)) * 90
        t = origin_time + timedelta(minutes=time_offset_minutes)
        if i < num_points // 2:
            factor = (i / (num_points // 2)) * 0.7 + 0.1
        else:
            factor = (1 - (i - num_points // 2) / (num_points - num_points // 2)) * 0.7 + 0.1
        distance_km = 3 + factor * 25 + random.uniform(-2, 2)
        angle_rad = math.radians(course_deg + random.uniform(-8, 8))
        lat = origin_lat + (distance_km * math.cos(angle_rad) / 111)
        lon = origin_lon + (distance_km * math.sin(angle_rad) / (111 * math.cos(math.radians(origin_lat))))
        trajectory.append({
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "timestamp": t.isoformat(),
            "speed": round(speed_knots + random.uniform(-2, 2), 1)
        })
    return trajectory

def seed_single_incident(db: Session, location):
    detection_time = datetime.fromisoformat(location["detectionTime"].replace('Z', '+00:00'))
    estimated_spill_time = datetime.fromisoformat(location["estimatedSpillTime"].replace('Z', '+00:00'))

    # Determine if incident is resolved
    status = location.get("status", "UNDER_INVESTIGATION")
    if status == "RESOLVED":
        incident_status = IncidentStatus.RESOLVED
    else:
        incident_status = IncidentStatus[status] if status in IncidentStatus.__members__ else IncidentStatus.UNDER_INVESTIGATION

    severity = Severity[location["severity"]] if location["severity"] in Severity.__members__ else Severity.MEDIUM

    incident = Incident(
        id=location["id"],
        name=location.get("name", location["locationName"]),
        status=incident_status,
        severity=severity,
        detection_time=detection_time,
        satellite_platform=location.get("satellitePlatform", "Sentinel-1B SAR"),
        sensor=location.get("sensor", "C-Band IW"),
        resolution_meters=location.get("resolutionMeters", 10),
        latitude=location["latitude"],
        longitude=location["longitude"],
        location_name=location["locationName"],
        spill_area_km2=location["spillAreaKm2"],
        spill_length_km=location.get("spillLengthKm", 0.0),
        spill_max_width_km=location.get("spillMaxWidthKm", 0.0),
        orientation=location.get("orientation", ""),
        confidence=location["confidence"],
        oil_probability=location.get("oilProbability", location["confidence"]),
        lookalike_probability=location.get("lookalikeProbability", 0.0),
        no_oil_probability=location.get("noOilProbability", 0.0),
        probable_origin_lat=location["probableOriginLat"],
        probable_origin_lon=location["probableOriginLon"],
        origin_confidence=location.get("originConfidence", 80.0),
        estimated_spill_time=estimated_spill_time,
        candidate_vessels_count=0
    )
    db.add(incident)
    db.flush()

    # Generate vessels with different courses and speeds
    vessel_data = [
        {"name": f"Vessel A {incident.id}", "course": 220 + random.randint(0, 20), "speed": 10 + random.random()*5},
        {"name": f"Vessel B {incident.id}", "course": 200 + random.randint(0, 30), "speed": 12 + random.random()*4},
        {"name": f"Vessel C {incident.id}", "course": 240 + random.randint(0, 20), "speed": 14 + random.random()*3},
        {"name": f"Vessel D {incident.id}", "course": 210 + random.randint(0, 25), "speed": 11 + random.random()*4},
        {"name": f"Vessel E {incident.id}", "course": 230 + random.randint(0, 15), "speed": 13 + random.random()*3},
        {"name": f"Vessel F {incident.id}", "course": 190 + random.randint(0, 30), "speed": 9 + random.random()*4},
        {"name": f"Vessel G {incident.id}", "course": 250 + random.randint(0, 20), "speed": 15 + random.random()*2},
        {"name": f"Vessel H {incident.id}", "course": 180 + random.randint(0, 40), "speed": 8 + random.random()*3},
    ]

    orientation_angle = extract_angle(location.get("orientation", ""))

    vessels_created = []
    for i, data in enumerate(vessel_data):
        mmsi = f"12345678{i}{incident.id[-1]}"
        trajectory = generate_trajectory(
            origin_lat=location["probableOriginLat"],
            origin_lon=location["probableOriginLon"],
            origin_time=estimated_spill_time,
            course_deg=data["course"],
            speed_knots=data["speed"],
            num_points=10
        )
        min_dist = float('inf')
        closest_point = None
        for pt in trajectory:
            dist = haversine(location["probableOriginLat"], location["probableOriginLon"], pt["lat"], pt["lon"])
            if dist < min_dist:
                min_dist = dist
                closest_point = pt
        time_diff = abs((datetime.fromisoformat(closest_point["timestamp"]) - estimated_spill_time).total_seconds()) / 3600
        proximity = 100 * math.exp(-min_dist / 20)
        temporal = 100 * math.exp(-time_diff / 2)
        trajectory_score = 80 + random.uniform(0, 20)
        drift = 70 + random.uniform(0, 30)
        anomaly = 50 + random.uniform(0, 40)
        total = 0.30 * proximity + 0.25 * temporal + 0.25 * trajectory_score + 0.10 * drift + 0.10 * anomaly
        is_candidate = min_dist < 30 and time_diff < 4

        vessel = Vessel(
            mmsi=mmsi,
            name=data["name"],
            type=["Crude Oil Tanker", "Chemical Tanker", "Bulk Carrier", "Container Ship", "LPG Tanker", "Bulk Carrier", "General Cargo", "Fishing Vessel"][i % 8],
            flag=["Panama", "Liberia", "Marshall Islands", "Singapore", "India", "Cyprus", "United Kingdom", "India"][i % 8],
            call_sign=f"VSL{i:03d}",
            length_meters=150 + random.uniform(0, 80),
            beam_meters=20 + random.uniform(0, 15),
            current_lat=trajectory[-1]["lat"],
            current_lon=trajectory[-1]["lon"],
            speed_knots=data["speed"],
            course_deg=data["course"],
            heading_deg=data["course"],
            first_seen=trajectory[0]["timestamp"],
            last_seen=trajectory[-1]["timestamp"],
            closest_approach_distance_km=round(min_dist, 2),
            closest_approach_time=closest_point["timestamp"],
            proximity_score=round(proximity, 1),
            time_score=round(temporal, 1),
            trajectory_score=round(trajectory_score, 1),
            drift_score=round(drift, 1),
            anomaly_score=round(anomaly, 1),
            total_association_score=round(total, 1),
            association_category=(
                "High Association" if total >= 85 else
                "Medium Association" if total >= 70 else
                "Requires Investigation" if total >= 50 else
                "Low Association" if total >= 30 else
                "Low Probability"
            ),
            is_candidate=is_candidate,
            trajectory=trajectory,
            evidence_items=[
                f"Passed within {min_dist:.1f} km of origin",
                f"Timing overlaps release window ({estimated_spill_time.strftime('%H:%M')} UTC)",
                f"Course aligns with spill axis ({data['course']}° vs {orientation_angle}°)",
                f"Speed variation detected at {closest_point['timestamp']}"
            ],
            anomalies_detected=[
                f"Speed fluctuation at {closest_point['timestamp']} UTC",
                "Minor course deviation" if random.random() > 0.5 else "Normal route pattern"
            ],
            incident_id=incident.id
        )
        db.add(vessel)
        vessels_created.append(vessel)

    incident.candidate_vessels_count = len([v for v in vessels_created if v.is_candidate])
    db.commit()
    db.refresh(incident)
    print(f"✅ Seeded: {incident.id} - {incident.name}")

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(Vessel).delete()
        db.query(Incident).delete()
        db.commit()
        # Seed only the three historical incidents
        target_ids = ["MR-2010-MUMBAI", "MR-2017-ENNORE", "MR-2025-KERALA"]
        for loc in coastalLocations:
            if loc["id"] in target_ids:
                seed_single_incident(db, loc)
        print("\n✅ All three historical incidents seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()