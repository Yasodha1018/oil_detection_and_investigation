from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    vessel_mmsi = Column(String, ForeignKey("vessels.mmsi"), nullable=True)
    evidence_type = Column(String, nullable=False)  # satellite, ais, drift, weather, behaviour
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)
    source = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=True)
    meta_data = Column(JSON, default={})          # renamed from 'metadata'
    created_at = Column(DateTime, server_default=func.now())

    incident = relationship("Incident", back_populates="evidence")
    vessel = relationship("Vessel", back_populates="evidence")