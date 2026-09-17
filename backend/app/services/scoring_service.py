import math
from typing import List, Dict, Optional
from datetime import datetime

class ScoringService:
    """
    Multi-criteria association scoring for vessels.
    Weights:
      - Spatial Proximity: 30%
      - Temporal Correlation: 25%
      - Trajectory Similarity: 25%
      - Drift Consistency: 10%
      - Behaviour Anomaly: 10%
    """

    WEIGHTS = {
        "spatial": 0.30,
        "temporal": 0.25,
        "trajectory": 0.25,
        "drift": 0.10,
        "anomaly": 0.10
    }

    def __init__(self):
        self.live = False  # Would be set to True with real data sources

    def compute_scores(self, vessels: List[Dict], origin_lat: float, origin_lon: float,
                       spill_time: str, drift_angles: List[float] = []) -> List[Dict]:
        """Compute all scores for a list of vessels."""
        scored = []
        spill_dt = datetime.fromisoformat(spill_time.replace('Z', '+00:00'))

        for vessel in vessels:
            # 1. Spatial Proximity (exponential decay based on distance)
            dist = vessel.get('closest_distance', 9999)
            spatial_score = max(0, 100 * math.exp(-dist / 20))

            # 2. Temporal Correlation (Gaussian overlap)
            closest_time = vessel.get('closest_time')
            if closest_time:
                try:
                    t = datetime.fromisoformat(closest_time)
                    diff_minutes = abs((t - spill_dt).total_seconds() / 60)
                    temporal_score = max(0, 100 * math.exp(- (diff_minutes ** 2) / (2 * 30**2)))
                except:
                    temporal_score = 50
            else:
                temporal_score = 50

            # 3. Trajectory Similarity (course alignment with slick axis)
            course = vessel.get('course_deg', 0)
            if drift_angles:
                # Average angular difference
                angle_diff = min(abs(course - drift_angles[0]), 360 - abs(course - drift_angles[0]))
                trajectory_score = max(0, 100 * (1 - angle_diff / 180))
            else:
                trajectory_score = 70  # default moderate

            # 4. Drift Consistency (overlap with drift envelope) - simplified
            drift_score = 80 if vessel.get('is_candidate', False) else 50

            # 5. Behaviour Anomaly (speed drops, course changes)
            anomalies = vessel.get('anomalies_detected', [])
            anomaly_score = max(0, 100 - (len(anomalies) * 5))  # each anomaly reduces score

            # Total
            total = (
                self.WEIGHTS["spatial"] * spatial_score +
                self.WEIGHTS["temporal"] * temporal_score +
                self.WEIGHTS["trajectory"] * trajectory_score +
                self.WEIGHTS["drift"] * drift_score +
                self.WEIGHTS["anomaly"] * anomaly_score
            )

            vessel['proximity_score'] = round(spatial_score, 1)
            vessel['time_score'] = round(temporal_score, 1)
            vessel['trajectory_score'] = round(trajectory_score, 1)
            vessel['drift_score'] = round(drift_score, 1)
            vessel['anomaly_score'] = round(anomaly_score, 1)
            vessel['total_association_score'] = round(total, 1)
            vessel['association_category'] = self._get_category(total)

            scored.append(vessel)

        return scored

    def _get_category(self, score: float) -> str:
        if score >= 85:
            return "High Association"
        elif score >= 70:
            return "Medium Association"
        elif score >= 50:
            return "Requires Investigation"
        elif score >= 30:
            return "Low Association"
        else:
            return "Low Probability"

    def rank_vessels(self, vessels: List[Dict], incident_id: str) -> List[Dict]:
        """Rank vessels for an incident, computing scores on the fly."""
        # For demo, we could fetch the incident's origin and time
        scored = sorted(vessels, key=lambda v: v.get('total_association_score', 0), reverse=True)
        return scored

    def explain_score(self, vessel: Dict) -> Dict:
        """Return a breakdown of the score components."""
        return {
            "spatial": {"score": vessel.get("proximity_score", 0), "weight": self.WEIGHTS["spatial"]},
            "temporal": {"score": vessel.get("time_score", 0), "weight": self.WEIGHTS["temporal"]},
            "trajectory": {"score": vessel.get("trajectory_score", 0), "weight": self.WEIGHTS["trajectory"]},
            "drift": {"score": vessel.get("drift_score", 0), "weight": self.WEIGHTS["drift"]},
            "anomaly": {"score": vessel.get("anomaly_score", 0), "weight": self.WEIGHTS["anomaly"]}
        }