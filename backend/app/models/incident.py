from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database.database import Base
import enum

class IncidentStatus(str, enum.Enum):
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    VERIFIED_SPILL = "VERIFIED_SPILL"
    MONITORING = "MONITORING"
    RESOLVED = "RESOLVED"

class Severity(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.UNDER_INVESTIGATION)
    severity = Column(Enum(Severity), default=Severity.MEDIUM)
    detection_time = Column(DateTime, nullable=False)
    satellite_platform = Column(String, nullable=False)
    sensor = Column(String, nullable=False)
    resolution_meters = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=False)
    spill_area_km2 = Column(Float, default=0.0)
    spill_length_km = Column(Float, default=0.0)
    spill_max_width_km = Column(Float, default=0.0)
    orientation = Column(String, default="")
    confidence = Column(Float, default=0.0)
    oil_probability = Column(Float, default=0.0)
    lookalike_probability = Column(Float, default=0.0)
    no_oil_probability = Column(Float, default=0.0)
    probable_origin_lat = Column(Float, default=0.0)
    probable_origin_lon = Column(Float, default=0.0)
    origin_confidence = Column(Float, default=0.0)
    estimated_spill_time = Column(DateTime, nullable=True)
    candidate_vessels_count = Column(Integer, default=0)

    # Relationships
    vessels = relationship("Vessel", back_populates="incident")
    spill_geometries = relationship("SpillGeometry", back_populates="incident")
    evidence = relationship("Evidence", back_populates="incident")