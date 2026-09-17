import math
from typing import List, Tuple, Dict
from .openmeteo_service import OpenMeteoService

class DriftService:
    def __init__(self):
        self.weather_service = OpenMeteoService()
        self.earth_radius_km = 6371
        self.wind_leeway = 0.035

    def get_drift_conditions(self, lat: float, lon: float) -> Dict:
        """Return live (or demo) wind and current for a given location."""
        weather = self.weather_service.get_weather(lat, lon)
        ocean = self.weather_service.get_ocean(lat, lon)
        return {
            "wind_speed_kts": weather["wind_speed_kts"],
            "wind_direction_deg": weather["wind_direction_deg"],
            "current_speed_kts": ocean["current_speed_kts"],
            "current_direction_deg": ocean["current_direction_deg"],
            "temperature": weather.get("temperature", 28),
            "timestamp": weather.get("timestamp", "")
        }

    def project(self, lat: float, lon: float, hours: float,
                current_speed_kts: float, current_dir_deg: float,
                wind_speed_kts: float, wind_dir_deg: float,
                backward: bool = False) -> Tuple[float, float]:
        sign = -1 if backward else 1
        current_kmh = current_speed_kts * 1.852
        wind_kmh = wind_speed_kts * 1.852 * self.wind_leeway
        cur_rad = math.radians(current_dir_deg)
        wind_rad = math.radians(wind_dir_deg)
        dx = (current_kmh * math.sin(cur_rad) + wind_kmh * math.sin(wind_rad)) * hours * sign
        dy = (current_kmh * math.cos(cur_rad) + wind_kmh * math.cos(wind_rad)) * hours * sign
        dlat = dy / 111.0
        dlon = dx / (111.0 * math.cos(math.radians(lat)))
        return lat + dlat, lon + dlon

    def backtrack(self, start_lat: float, start_lon: float, duration_hours: float,
                  current: Dict, wind: Dict) -> List[Tuple[float, float]]:
        points = []
        lat, lon = start_lat, start_lon
        steps = int(duration_hours * 2)
        for _ in range(steps):
            lat, lon = self.project(lat, lon, 0.5,
                                    current["speed"], current["direction"],
                                    wind["speed"], wind["direction"],
                                    backward=True)
            points.append((lat, lon))
        return points

    def forecast(self, start_lat: float, start_lon: float, duration_hours: float,
                 current: Dict, wind: Dict) -> List[Tuple[float, float]]:
        points = []
        lat, lon = start_lat, start_lon
        steps = int(duration_hours * 2)
        for _ in range(steps):
            lat, lon = self.project(lat, lon, 0.5,
                                    current["speed"], current["direction"],
                                    wind["speed"], wind["direction"],
                                    backward=False)
            points.append((lat, lon))
        return points