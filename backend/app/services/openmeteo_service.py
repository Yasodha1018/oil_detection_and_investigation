import requests
from typing import Dict, Optional
from ..config import config

class OpenMeteoService:
    def __init__(self):
        self.weather_url = config.WEATHER_API_URL
        self.marine_url = config.OCEAN_API_URL
        self.live = config.LIVE_MODE

    def get_weather(self, lat: float, lon: float) -> Dict:
        """Fetch live wind speed (knots) and direction (degrees)."""
        if not self.live:
            return self._demo_weather()

        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True,
            "forecast_days": 1
        }
        try:
            resp = requests.get(self.weather_url, params=params, timeout=8)
            resp.raise_for_status()
            data = resp.json()
            current = data.get("current_weather", {})
            wind_speed_kmh = current.get("windspeed", 14.5)  # km/h
            wind_dir = current.get("winddirection", 45)
            return {
                "wind_speed_kts": round(wind_speed_kmh * 0.539957, 1),  # km/h → knots
                "wind_direction_deg": wind_dir,
                "temperature": current.get("temperature", 25),
                "timestamp": current.get("time", "")
            }
        except Exception as e:
            print(f"[OpenMeteo] Weather fetch failed: {e}")
            return self._demo_weather()

    def get_ocean(self, lat: float, lon: float) -> Dict:
        """Fetch live ocean current speed (knots) and direction."""
        if not self.live:
            return self._demo_ocean()

        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "currents",
            "forecast_days": 1
        }
        try:
            resp = requests.get(self.marine_url, params=params, timeout=8)
            resp.raise_for_status()
            data = resp.json()
            hourly = data.get("hourly", {})
            currents = hourly.get("currents", [])
            if currents:
                # currents[0] is eastward (u) in m/s, currents[1] is northward (v)
                u = currents[0] if len(currents) > 0 else 0.0
                v = currents[1] if len(currents) > 1 else 0.0
                speed_ms = (u**2 + v**2) ** 0.5
                speed_kts = speed_ms * 1.94384
                direction = (90 - (math.atan2(v, u) * 180 / math.pi)) % 360
                return {
                    "current_speed_kts": round(speed_kts, 2),
                    "current_direction_deg": round(direction, 1)
                }
            return self._demo_ocean()
        except Exception as e:
            print(f"[OpenMeteo] Ocean fetch failed: {e}")
            return self._demo_ocean()

    def _demo_weather(self):
        return {
            "wind_speed_kts": 14.5,
            "wind_direction_deg": 45,
            "temperature": 28,
            "timestamp": "demo"
        }

    def _demo_ocean(self):
        return {
            "current_speed_kts": 1.4,
            "current_direction_deg": 52
        }