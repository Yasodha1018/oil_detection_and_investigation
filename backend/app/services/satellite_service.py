import requests
import math
from datetime import datetime, timedelta
from typing import List, Dict
from ..config import config

class SatelliteService:
    def __init__(self):
        self.live = config.LIVE_MODE
        self.client_id = config.COPERNICUS_CLIENT_ID
        self.client_secret = config.COPERNICUS_CLIENT_SECRET
        self.token = None
        self.token_expiry = None

    def _get_token(self):
        if not self.live:
            return None
        if self.token and self.token_expiry > datetime.now():
            return self.token
        auth_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }
        resp = requests.post(auth_url, data=data, timeout=10)
        resp.raise_for_status()
        token_data = resp.json()
        self.token = token_data["access_token"]
        self.token_expiry = datetime.now() + timedelta(seconds=token_data["expires_in"])
        return self.token

    def search_recent_scenes(self, lat: float, lon: float, radius_km: float = 50,
                             days_back: int = 2) -> List[Dict]:
        """Fetch recent Sentinel‑1 scenes within a radius."""
        if not self.live:
            return self._demo_scenes()

        token = self._get_token()
        bbox = self._bbox_from_point(lat, lon, radius_km)
        end = datetime.utcnow()
        start = end - timedelta(days=days_back)
        query = {
            "collections": ["SENTINEL-1"],
            "datetime": f"{start.isoformat()}/{end.isoformat()}",
            "bbox": bbox,
            "query": {"platform": {"eq": "sentinel-1"}},
            "limit": 50
        }
        headers = {"Authorization": f"Bearer {token}"}
        url = "https://catalogue.dataspace.copernicus.eu/stac/search"
        resp = requests.post(url, json=query, headers=headers, timeout=15)
        resp.raise_for_status()
        features = resp.json().get("features", [])
        return self._parse_stac_features(features)

    def _demo_scenes(self):
        # Return deterministic demo scenes for offline mode
        return [{
            "id": "demo_scene_001",
            "acquisition_time": datetime.now().isoformat(),
            "satellite": "Sentinel-1B",
            "preview_url": "/api/satellite/demo/preview",
            "download_url": "/api/satellite/demo/download",
            "mode": "demo"
        }]

    def _bbox_from_point(self, lat, lon, radius_km):
        deg_per_km = 1 / 111.32
        dlat = radius_km * deg_per_km
        dlon = radius_km * deg_per_km / math.cos(math.radians(lat))
        return [lon - dlon, lat - dlat, lon + dlon, lat + dlat]

    def _parse_stac_features(self, features):
        results = []
        for f in features:
            props = f.get("properties", {})
            assets = f.get("assets", {})
            results.append({
                "id": f.get("id"),
                "acquisition_time": props.get("datetime"),
                "satellite": props.get("platform", "Sentinel-1"),
                "preview_url": assets.get("thumbnail", {}).get("href"),
                "download_url": assets.get("data", {}).get("href"),
                "mode": "live"
            })
        return results