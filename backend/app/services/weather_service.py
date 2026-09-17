import requests
from datetime import datetime
from ..config import config

class WeatherService:
    def __init__(self):
        self.url = config.WEATHER_API_URL

    def get_current_weather(self, lat: float, lon: float):
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True,
            "hourly": "wind_speed_10m,wind_direction_10m,temperature_2m",
            "timezone": "UTC"
        }
        resp = requests.get(self.url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return {
            "wind_speed_kts": data["current_weather"]["windspeed"] * 0.539957,  # m/s → knots
            "wind_direction_deg": data["current_weather"]["winddirection"],
            "temperature_c": data["current_weather"]["temperature"],
            "time": datetime.utcnow().isoformat()
        }