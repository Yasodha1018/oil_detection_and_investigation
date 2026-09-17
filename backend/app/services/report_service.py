import json
from datetime import datetime
from typing import List, Dict, Any
import io

from ..models.incident import Incident
from ..models.vessel import Vessel
from ..config import config

class ReportService:
    """Generate investigation reports in PDF or JSON format."""

    def generate_pdf(self, incident: Incident, vessels: List[Vessel]) -> bytes:
        """
        Generate a PDF report (simplified; in production use a library like ReportLab or WeasyPrint).
        This returns a dummy PDF for demonstration.
        """
        # In a real implementation, we'd use reportlab or fpdf.
        # For demo, return a simple text buffer mimicking a PDF.
        content = f"""
        ============================================================
        MARITRACE OFFICIAL INVESTIGATION REPORT
        ============================================================

        Incident ID: {incident.id}
        Name: {incident.name}
        Status: {incident.status}
        Severity: {incident.severity}
        Detection Time: {incident.detection_time.isoformat()}
        Location: {incident.location_name}
        Coordinates: {incident.latitude}°, {incident.longitude}°
        Spill Area: {incident.spill_area_km2} km²
        Confidence: {incident.confidence}%

        Probable Origin: {incident.probable_origin_lat}°, {incident.probable_origin_lon}°
        Origin Confidence: {incident.origin_confidence}%

        Candidate Vessels: {incident.candidate_vessels_count}

        Top Candidates:
        """
        for idx, v in enumerate(vessels[:5]):
            content += f"\n  {idx+1}. {v.name} (MMSI: {v.mmsi}) - Score: {v.total_association_score}%\n"

        content += f"""
        ============================================================
        Report generated: {datetime.now().isoformat()}
        System mode: {config.LIVE_MODE}
        Disclaimer: This is an AI-assisted decision-support tool.
        Legal responsibility must be established through proper investigation.
        ============================================================
        """
        return content.encode('utf-8')

    def generate_json(self, incident: Incident, vessels: List[Vessel]) -> Dict[str, Any]:
        """Generate a JSON report."""
        return {
            "incident": {
                "id": incident.id,
                "name": incident.name,
                "status": incident.status,
                "severity": incident.severity,
                "detection_time": incident.detection_time.isoformat(),
                "location": incident.location_name,
                "coordinates": [incident.latitude, incident.longitude],
                "spill_area_km2": incident.spill_area_km2,
                "confidence": incident.confidence,
                "probable_origin": [incident.probable_origin_lat, incident.probable_origin_lon],
                "origin_confidence": incident.origin_confidence,
                "estimated_spill_time": incident.estimated_spill_time.isoformat() if incident.estimated_spill_time else None
            },
            "vessels": [
                {
                    "mmsi": v.mmsi,
                    "name": v.name,
                    "type": v.type,
                    "flag": v.flag,
                    "closest_approach_km": v.closest_approach_distance_km,
                    "total_score": v.total_association_score,
                    "category": v.association_category,
                    "evidence_items": v.evidence_items,
                    "anomalies": v.anomalies_detected
                }
                for v in vessels
            ],
            "generated_at": datetime.now().isoformat(),
            "mode": "live" if config.LIVE_MODE else "demo"
        }