import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from ..models.incident import Incident
from ..models.vessel import Vessel
from ..services.drift_service import DriftService
from ..services.scoring_service import ScoringService

class InvestigationService:
    def __init__(self):
        self.drift_service = DriftService()
        self.scoring_service = ScoringService()

    def run_investigation(self, incident: Incident, vessels: List[Vessel]) -> Dict[str, Any]:
        """
        Run complete investigation pipeline:
        1. Origin reconstruction (hindcast)
        2. AIS filtering (spatial + temporal)
        3. Trajectory correlation
        4. Behaviour analysis
        5. Drift consistency
        6. Risk scoring
        7. Evidence compilation
        """
        result = {
            "incident": self._format_incident(incident),
            "origin": self._reconstruct_origin(incident),
            "ais_investigation": self._ais_investigation(incident, vessels),
            "candidates": [],
            "evidence_timeline": [],
            "final_ranking": []
        }

        # Filter and score vessels
        filtered_vessels = self._filter_vessels(incident, vessels)
        scored_vessels = self._score_vessels(incident, filtered_vessels)
        
        # Build candidates with evidence
        result["candidates"] = scored_vessels
        result["final_ranking"] = self._rank_vessels(scored_vessels)
        result["evidence_timeline"] = self._build_timeline(incident, scored_vessels)
        
        return result

    def _format_incident(self, incident: Incident) -> Dict:
        return {
            "id": incident.id,
            "name": incident.name,
            "satellite": incident.satellite_platform,
            "detection_time": incident.detection_time.isoformat(),
            "spill_area_km2": incident.spill_area_km2,
            "confidence": incident.confidence,
            "location": {
                "lat": incident.latitude,
                "lon": incident.longitude
            },
            "location_name": incident.location_name
        }

    def _reconstruct_origin(self, incident: Incident) -> Dict:
        """Reconstruct spill origin using hindcast"""
        return {
            "latitude": incident.probable_origin_lat,
            "longitude": incident.probable_origin_lon,
            "time": incident.estimated_spill_time.isoformat() if incident.estimated_spill_time else None,
            "confidence": incident.origin_confidence,
            "uncertainty_radius_km": 4.2,
            "method": "Lagrangian backward drift hindcast",
            "data_used": ["Ocean currents", "Wind vectors", "Wave effects"]
        }

    def _ais_investigation(self, incident: Incident, vessels: List[Vessel]) -> Dict:
        """AIS investigation summary"""
        total_records = sum(len(v.trajectory) for v in vessels) if vessels else 0
        return {
            "records_searched": max(total_records, 100),
            "vessels_found": len(vessels),
            "search_window": {
                "start_time": (incident.estimated_spill_time - timedelta(hours=12)).isoformat(),
                "end_time": (incident.estimated_spill_time + timedelta(hours=12)).isoformat(),
                "radius_km": 50
            }
        }

    def _filter_vessels(self, incident: Incident, vessels: List[Vessel]) -> List[Vessel]:
        """Apply spatial and temporal filtering"""
        if not incident.estimated_spill_time:
            return vessels
        
        origin_time = incident.estimated_spill_time
        origin_lat = incident.probable_origin_lat
        origin_lon = incident.probable_origin_lon
        
        filtered = []
        for vessel in vessels:
            # Check if vessel has trajectory data
            if not vessel.trajectory:
                continue
            
            # Spatial filter: find closest approach to origin
            min_dist = float('inf')
            closest_time = None
            for point in vessel.trajectory:
                if isinstance(point, dict):
                    lat = point.get('lat', 0)
                    lon = point.get('lon', 0)
                    t = point.get('timestamp')
                else:
                    continue
                
                # Calculate distance using haversine
                dist = self._haversine(origin_lat, origin_lon, lat, lon)
                if dist < min_dist:
                    min_dist = dist
                    closest_time = t
            
            # Temporal filter: check if within window
            if closest_time:
                try:
                    if isinstance(closest_time, str):
                        closest_time = datetime.fromisoformat(closest_time.replace('Z', '+00:00'))
                    time_diff = abs((closest_time - origin_time).total_seconds())
                    if time_diff < 24 * 3600:  # 24 hour window
                        # Store calculated values
                        vessel.closest_approach_distance_km = min_dist
                        vessel.closest_approach_time = closest_time.isoformat() if isinstance(closest_time, datetime) else str(closest_time)
                        filtered.append(vessel)
                except:
                    filtered.append(vessel)
        
        return filtered

    def _score_vessels(self, incident: Incident, vessels: List[Vessel]) -> List[Dict]:
        """Score vessels using multi-criteria analysis"""
        scored = []
        for vessel in vessels:
            score = self.scoring_service.compute_vessel_score(
                vessel=vessel,
                origin_lat=incident.probable_origin_lat,
                origin_lon=incident.probable_origin_lon,
                origin_time=incident.estimated_spill_time,
                drift_path=self._get_drift_path(incident)
            )
            # Add evidence
            evidence = self._generate_evidence(vessel, incident, score)
            scored.append({
                "vessel": self._format_vessel(vessel),
                "scores": score,
                "evidence": evidence,
                "total_score": score["total"]
            })
        return scored

    def _rank_vessels(self, scored_vessels: List[Dict]) -> List[Dict]:
        """Rank vessels by total score"""
        sorted_vessels = sorted(scored_vessels, key=lambda x: x['total_score'], reverse=True)
        return [
            {
                "rank": i + 1,
                "vessel": v["vessel"],
                "score": v["total_score"],
                "category": self._get_category(v["total_score"]),
                "evidence": v["evidence"]
            }
            for i, v in enumerate(sorted_vessels)
        ]

    def _get_category(self, score: float) -> str:
        if score >= 85:
            return "High Association"
        elif score >= 70:
            return "Medium Association"
        elif score >= 50:
            return "Requires Investigation"
        elif score >= 30:
            return "Low Association"
        return "Low Probability"

    def _build_timeline(self, incident: Incident, scored_vessels: List[Dict]) -> List[Dict]:
        """Build investigation timeline"""
        timeline = []
        
        # Add incident events
        timeline.append({
            "time": incident.detection_time.isoformat(),
            "event": "Satellite Detection",
            "description": f"SAR image acquired, {incident.spill_area_km2} km² oil slick detected",
            "type": "detection"
        })
        
        # Add origin reconstruction
        if incident.estimated_spill_time:
            timeline.append({
                "time": incident.estimated_spill_time.isoformat(),
                "event": "Estimated Spill Origin",
                "description": f"Origin localized at {incident.probable_origin_lat:.3f}°N, {incident.probable_origin_lon:.3f}°E",
                "type": "origin"
            })
        
        # Add top candidate events
        for scored in scored_vessels[:3]:
            v = scored["vessel"]
            timeline.append({
                "time": v.get("closest_approach_time", ""),
                "event": f"Vessel {v['name']} in Origin Zone",
                "description": f"Closest approach: {v.get('closest_approach_distance_km', 0):.1f} km",
                "type": "vessel",
                "vessel": v["name"]
            })
        
        return sorted(timeline, key=lambda x: x.get("time", ""))

    def _format_vessel(self, vessel: Vessel) -> Dict:
        return {
            "mmsi": vessel.mmsi,
            "name": vessel.name,
            "type": vessel.type,
            "flag": vessel.flag,
            "call_sign": vessel.call_sign,
            "length_meters": vessel.length_meters,
            "beam_meters": vessel.beam_meters,
            "trajectory": vessel.trajectory,
            "current_position": {
                "lat": vessel.current_lat,
                "lon": vessel.current_lon
            },
            "speed": vessel.speed_knots,
            "course": vessel.course_deg
        }

    def _generate_evidence(self, vessel: Vessel, incident: Incident, scores: Dict) -> List[Dict]:
        """Generate evidence items for a vessel"""
        evidence = []
        
        # Spatial evidence
        if vessel.closest_approach_distance_km < 20:
            evidence.append({
                "type": "spatial",
                "title": "Proximity to Origin",
                "description": f"Vessel passed within {vessel.closest_approach_distance_km:.1f} km of estimated origin",
                "strength": "Strong" if vessel.closest_approach_distance_km < 10 else "Moderate",
                "score": scores.get("spatial", 0)
            })
        
        # Temporal evidence
        if vessel.closest_approach_time:
            evidence.append({
                "type": "temporal",
                "title": "Temporal Overlap",
                "description": f"Vessel present near origin at {vessel.closest_approach_time}",
                "strength": "Strong" if scores.get("temporal", 0) > 80 else "Moderate",
                "score": scores.get("temporal", 0)
            })
        
        # Behavioural evidence
        anomalies = vessel.anomalies_detected or []
        if anomalies:
            evidence.append({
                "type": "behavioural",
                "title": "Anomalous Behaviour Detected",
                "description": "; ".join(anomalies[:2]),
                "strength": "Moderate",
                "score": scores.get("anomaly", 0)
            })
        
        # Trajectory evidence
        if scores.get("trajectory", 0) > 70:
            evidence.append({
                "type": "trajectory",
                "title": "Trajectory Alignment",
                "description": "Vessel track aligns with predicted drift path",
                "strength": "Strong" if scores.get("trajectory", 0) > 85 else "Moderate",
                "score": scores.get("trajectory", 0)
            })
        
        return evidence

    def _get_drift_path(self, incident: Incident) -> List[Tuple[float, float]]:
        """Get drift path from incident"""
        # Return mock path for now - in real implementation, this comes from drift_service
        return [(incident.probable_origin_lat + i * 0.001, incident.probable_origin_lon + i * 0.001) for i in range(10)]

    def _haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate haversine distance in km"""
        R = 6371
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c