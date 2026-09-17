import requests
from datetime import datetime, timedelta
from ..config import config

class OceanService:
    def __init__(self):
        self.username = config.COPERNICUS_USERNAME
        self.password = config.COPERNICUS_PASSWORD
        self.live = config.LIVE_MODE

    def get_currents(self, lat: float, lon: float, depth: str = "surface"):
        if not self.live:
            return self._demo_currents(lat, lon)

        # Authenticate and fetch from Copernicus Marine API
        # (actual endpoint depends on product; example with MOTU client)
        # For demonstration we'll return demo data
        return self._demo_currents(lat, lon)  # replace with real call

    def _demo_currents(self, lat, lon):
        # Return a simple current vector (in live mode, this would be real)
        return {
            "u": 0.5,   # east-west (m/s)
            "v": 0.6,   # north-south (m/s)
            "speed_kts": 1.4,
            "direction_deg": 52
        }