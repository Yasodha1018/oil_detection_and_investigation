from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database.database import Base

class Vessel(Base):
    __tablename__ = "vessels"

    mmsi = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    flag = Column(String, nullable=False)
    call_sign = Column(String, nullable=True)
    length_meters = Column(Float, default=0.0)
    beam_meters = Column(Float, default=0.0)
    current_lat = Column(Float, default=0.0)
    current_lon = Column(Float, default=0.0)
    speed_knots = Column(Float, default=0.0)
    course_deg = Column(Float, default=0.0)
    heading_deg = Column(Float, default=0.0)
    first_seen = Column(String, nullable=True)
    last_seen = Column(String, nullable=True)
    closest_approach_distance_km = Column(Float, default=0.0)
    closest_approach_time = Column(String, nullable=True)
    proximity_score = Column(Float, default=0.0)
    time_score = Column(Float, default=0.0)
    trajectory_score = Column(Float, default=0.0)
    drift_score = Column(Float, default=0.0)
    anomaly_score = Column(Float, default=0.0)
    total_association_score = Column(Float, default=0.0)
    association_category = Column(String, default="Low Probability")
    is_candidate = Column(Boolean, default=False)
    trajectory = Column(JSON, default=[])
    evidence_items = Column(JSON, default=[])
    anomalies_detected = Column(JSON, default=[])

    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    incident = relationship("Incident", back_populates="vessels")
    evidence = relationship("Evidence", back_populates="vessel")