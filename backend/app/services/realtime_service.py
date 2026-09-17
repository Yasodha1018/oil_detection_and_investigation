import asyncio
from datetime import datetime
from typing import List, Dict
from .satellite_service import SatelliteService
from .weather_service import WeatherService
from .ocean_service import OceanService
from .ais_service import AISService
from ..ml.inference import OilSpillDetector

class RealTimeService:
    def __init__(self):
        self.satellite = SatelliteService()
        self.weather = WeatherService()
        self.ocean = OceanService()
        self.ais = AISService()
        self.detector = OilSpillDetector()

        self.spills: List[Dict] = []
        self.vessels: List[Dict] = []
        self._running = False
        self._task = None

    async def start(self):
        self._running = True
        self._task = asyncio.create_task(self._update_loop())

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()

    async def _update_loop(self):
        while self._running:
            try:
                # 1. Fetch latest satellite scenes for a fixed area
                scenes = self.satellite.search_recent_scenes(18.6, 72.8, 50, 6)
                if scenes:
                    # Run detection on the latest scene (download + process)
                    latest = scenes[0]
                    # In production: download the image, run detector, store result
                    # For this example, we simulate a detection
                    new_spill = self._simulate_detection(latest)
                    if new_spill:
                        self.spills.insert(0, new_spill)

                # 2. Fetch current weather for the area
                weather = self.weather.get_current_weather(18.6, 72.8)

                # 3. Fetch ocean currents
                currents = self.ocean.get_currents(18.6, 72.8)

                # 4. Fetch AIS vessels nearby
                vessels = self.ais.get_vessels_nearby(18.6, 72.8, 50)
                self.vessels = vessels

            except Exception as e:
                print(f"Real-time update error: {e}")

            await asyncio.sleep(60)  # refresh every minute

    def _simulate_detection(self, scene):
        # In a real system, download the image and run the ML model
        # For now, we'll return a mock detection
        return {
            "id": f"SP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "name": "Live Spill Detected",
            "status": "UNDER_INVESTIGATION",
            "severity": "HIGH",
            "detection_time": datetime.now().isoformat(),
            "latitude": 18.6 + (datetime.now().second % 10) * 0.001,
            "longitude": 72.8 + (datetime.now().second % 10) * 0.001,
            "location_name": "Arabian Sea",
            "spill_area_km2": 20 + (datetime.now().second % 20),
            "confidence": 85 + (datetime.now().second % 10),
            "probable_origin_lat": 18.6,
            "probable_origin_lon": 72.8,
            "origin_confidence": 80,
            "estimated_spill_time": (datetime.now() - timedelta(hours=2)).isoformat(),
            "candidate_vessels_count": len(self.vessels)
        }