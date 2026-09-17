from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database.database import Base

class SpillGeometry(Base):
    __tablename__ = "spill_geometries"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    geometry_type = Column(String, default="Polygon")
    coordinates = Column(JSON, nullable=False)
    area_km2 = Column(Float, default=0.0)
    perimeter_km = Column(Float, default=0.0)
    centroid_lat = Column(Float, default=0.0)
    centroid_lon = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    detection_time = Column(DateTime, nullable=True)
    source = Column(String, default="AI")

    incident = relationship("Incident", back_populates="spill_geometries")