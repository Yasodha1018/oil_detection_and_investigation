import math
import cv2  # ✅ Add this import
import numpy as np
from typing import Tuple, Dict, List

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_spill_geometry(mask: np.ndarray, pixel_resolution_m: float = 10) -> Dict[str, float]:
    if mask.ndim != 2:
        raise ValueError("Mask must be 2D array")

    mask_bin = (mask > 0.5).astype(np.uint8) * 255
    contours, _ = cv2.findContours(mask_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return {
            "area_km2": 0.0,
            "perimeter_km": 0.0,
            "width_km": 0.0,
            "length_km": 0.0,
            "centroid_lat": 0.0,
            "centroid_lon": 0.0,
            "orientation_deg": 0.0
        }

    largest = max(contours, key=cv2.contourArea)
    area_pixels = cv2.contourArea(largest)
    area_km2 = area_pixels * (pixel_resolution_m / 1000) ** 2
    perimeter_pixels = cv2.arcLength(largest, True)
    perimeter_km = perimeter_pixels * (pixel_resolution_m / 1000)
    x, y, w, h = cv2.boundingRect(largest)
    width_km = w * (pixel_resolution_m / 1000)
    length_km = h * (pixel_resolution_m / 1000)

    M = cv2.moments(largest)
    if M["m00"] != 0:
        cx_px = M["m10"] / M["m00"]
        cy_px = M["m01"] / M["m00"]
    else:
        cx_px, cy_px = 0, 0

    if len(contours) > 0:
        (_, _), (MA, ma), angle = cv2.fitEllipse(largest)
        orientation_deg = angle
    else:
        orientation_deg = 0.0

    return {
        "area_km2": round(area_km2, 3),
        "perimeter_km": round(perimeter_km, 3),
        "width_km": round(width_km, 3),
        "length_km": round(length_km, 3),
        "centroid_lat": round(cx_px * 0.0001, 5),  # placeholder – not real lat/lon
        "centroid_lon": round(cy_px * 0.0001, 5),
        "orientation_deg": round(orientation_deg, 1)
    }