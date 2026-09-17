import json
import websockets
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from ..config import config

class AISService:
    def __init__(self):
        self.live = config.LIVE_MODE
        self.api_key = config.AIS_API_KEY
        self.api_url = config.AIS_API_URL
        self.websocket = None
        self.vessels = {}

    async def connect(self):
        """Connect to AISStream.io WebSocket"""
        if not self.live:
            return
        
        try:
            self.websocket = await websockets.connect(self.api_url)
            # Authenticate with API key
            auth_message = json.dumps({
                "APIKey": self.api_key,
                "BoundingBoxes": [[[-90, -180], [90, 180]]]  # Global coverage
            })
            await self.websocket.send(auth_message)
            print("[AIS] Connected to AISStream.io")
            return True
        except Exception as e:
            print(f"[AIS] Connection failed: {e}")
            self.live = False
            return False

    async def listen_for_vessels(self):
        """Listen for live vessel updates"""
        if not self.live or not self.websocket:
            return

        try:
            while True:
                message = await self.websocket.recv()
                data = json.loads(message)
                await self._process_vessel_data(data)
        except websockets.exceptions.ConnectionClosed:
            print("[AIS] Connection closed, reconnecting...")
            await self.connect()

    async def _process_vessel_data(self, data: dict):
        """Process incoming AIS data"""
        if "MessageType" not in data:
            return

        # Position reports (Type 1, 2, 3)
        if data.get("MessageType") in [1, 2, 3]:
            vessel = {
                "mmsi": str(data.get("MMSI")),
                "lat": data.get("Latitude"),
                "lon": data.get("Longitude"),
                "speed": data.get("SOG", 0),  # Speed Over Ground
                "course": data.get("COG", 0),  # Course Over Ground
                "heading": data.get("Heading", 0),
                "timestamp": datetime.utcnow().isoformat(),
                "name": data.get("ShipName", "Unknown"),
                "type": data.get("ShipType", "Unknown"),
            }
            self.vessels[vessel["mmsi"]] = vessel
            # Broadcast via WebSocket to frontend
            from ..utils.websocket_manager import manager
            await manager.broadcast({
                "type": "vessel_update",
                "vessel": vessel
            })

    def get_nearby_vessels(self, lat: float, lon: float, radius_km: float) -> List[Dict]:
        """Get vessels within a radius from the live cache"""
        if not self.live:
            return self._demo_vessels(lat, lon)

        nearby = []
        for mmsi, vessel in self.vessels.items():
            # Calculate distance (simplified)
            distance = self._haversine_distance(lat, lon, vessel["lat"], vessel["lon"])
            if distance <= radius_km:
                nearby.append(vessel)
        return sorted(nearby, key=lambda x: x.get("distance", 999))[:50]

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        from math import radians, sin, cos, sqrt, atan2
        R = 6371
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

    def _demo_vessels(self, lat, lon):
        """Fallback demo vessels"""
        return [
            {
                "mmsi": "123456789",
                "name": "MV Ocean Star",
                "type": "Crude Oil Tanker",
                "lat": lat + 0.02,
                "lon": lon - 0.02,
                "speed": 11.4,
                "course": 238,
                "timestamp": datetime.now().isoformat(),
                "mode": "demo"
            },
            {
                "mmsi": "987654321",
                "name": "Sea Pioneer",
                "type": "Chemical Tanker",
                "lat": lat - 0.01,
                "lon": lon + 0.03,
                "speed": 12.8,
                "course": 220,
                "timestamp": datetime.now().isoformat(),
                "mode": "demo"
            },
            {
                "mmsi": "456789123",
                "name": "Blue Horizon",
                "type": "Bulk Carrier",
                "lat": lat + 0.03,
                "lon": lon + 0.01,
                "speed": 13.5,
                "course": 245,
                "timestamp": datetime.now().isoformat(),
                "mode": "demo"
            },
        ]