"""
Trajectory processing utilities: interpolation, filtering, similarity measures.
"""

import math
import numpy as np
from typing import List, Dict, Optional, Tuple
from .distance import haversine_distance

class TrajectoryUtils:
    """Utility class for vessel trajectory operations."""

    @staticmethod
    def interpolate_trajectory(points: List[Dict], interval_seconds: int = 60) -> List[Dict]:
        """
        Interpolate a trajectory to regular time intervals.
        Points should have 'timestamp' (datetime) and 'lat', 'lon'.
        Returns a list of dicts with interpolated positions.
        """
        if len(points) < 2:
            return points

        sorted_pts = sorted(points, key=lambda p: p['timestamp'])
        result = []
        for i in range(len(sorted_pts) - 1):
            p1 = sorted_pts[i]
            p2 = sorted_pts[i + 1]
            t1 = p1['timestamp']
            t2 = p2['timestamp']
            dt = (t2 - t1).total_seconds()
            if dt <= 0:
                continue
            steps = max(1, int(dt / interval_seconds))
            for j in range(steps):
                frac = j / steps
                lat = p1['lat'] + (p2['lat'] - p1['lat']) * frac
                lon = p1['lon'] + (p2['lon'] - p1['lon']) * frac
                t = t1 + (t2 - t1) * frac / steps
                result.append({
                    'lat': lat,
                    'lon': lon,
                    'timestamp': t,
                    'speed': p1.get('speed', 0)
                })
        result.append(sorted_pts[-1])
        return result

    @staticmethod
    def trajectory_length(points: List[Dict]) -> float:
        """Compute total length of a trajectory in kilometers."""
        if len(points) < 2:
            return 0.0
        total = 0.0
        for i in range(len(points) - 1):
            p1 = points[i]
            p2 = points[i + 1]
            total += haversine_distance(p1['lat'], p1['lon'], p2['lat'], p2['lon'])
        return total

    @staticmethod
    def trajectory_similarity(traj1: List[Dict], traj2: List[Dict]) -> float:
        """
        Compute similarity between two trajectories (simplified: overlap in space).
        Returns score 0-100.
        """
        if not traj1 or not traj2:
            return 0.0
        pts1 = traj1[:10]
        pts2 = traj2[:10]
        distances = []
        for p1 in pts1:
            for p2 in pts2:
                distances.append(haversine_distance(p1['lat'], p1['lon'], p2['lat'], p2['lon']))
        if not distances:
            return 0.0
        avg_dist = sum(distances) / len(distances)
        similarity = max(0, 100 * math.exp(-avg_dist / 10))
        return min(100, similarity)

    @staticmethod
    def detect_anomalies(points: List[Dict], speed_threshold: float = 2.0) -> List[Dict]:
        """
        Detect anomalies in trajectory: sudden speed changes, sharp turns, etc.
        Returns list of anomaly descriptions.
        """
        anomalies = []
        if len(points) < 3:
            return anomalies

        for i in range(1, len(points)):
            p1 = points[i-1]
            p2 = points[i]
            if 'speed' not in p1 or 'speed' not in p2:
                continue
            speed_diff = abs(p2['speed'] - p1['speed'])
            if speed_diff > speed_threshold:
                anomalies.append({
                    'type': 'speed_change',
                    'magnitude': speed_diff,
                    'timestamp': p2.get('timestamp'),
                    'description': f"Speed change of {speed_diff:.1f} knots"
                })
            if 'course' in p1 and 'course' in p2:
                course_diff = abs(p2['course'] - p1['course'])
                if course_diff > 30:
                    anomalies.append({
                        'type': 'course_change',
                        'magnitude': course_diff,
                        'timestamp': p2.get('timestamp'),
                        'description': f"Course change of {course_diff:.1f}°"
                    })
        return anomalies