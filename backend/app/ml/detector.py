import torch
import cv2
import numpy as np
from pathlib import Path
from .segmentation import UNet
from .preprocessing import preprocess_sar_image, prepare_model_input
from ..config import config
from ..geospatial.distance import compute_spill_geometry

class OilSpillDetector:
    def __init__(self):
        self.model_path = Path(config.MODEL_PATH)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.ready = False
        self._load_model()

    def _load_model(self):
        if self.model_path.exists():
            try:
                self.model = UNet(n_channels=3, n_classes=1)
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint["model_state_dict"])
                self.model.to(self.device)
                self.model.eval()
                self.ready = True
                print(f"[Detector] Model loaded from {self.model_path}")
            except Exception as e:
                print(f"[Detector] Failed to load model: {e}")
                self.ready = False
        else:
            print(f"[Detector] Model not found at {self.model_path} – using demo mode")
            self.ready = False

    def _predict_mask(self, image_np):
        if not self.ready or self.model is None:
            # Demo fallback: simple threshold
            gray = image_np if len(image_np.shape) == 2 else cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            _, mask = cv2.threshold((gray * 255).astype(np.uint8), 60, 255, cv2.THRESH_BINARY)
            return (mask / 255.0).astype(np.float32)

        input_tensor = prepare_model_input(image_np)
        input_tensor = torch.from_numpy(input_tensor).to(self.device)
        with torch.no_grad():
            output = self.model(input_tensor)
            mask = output.cpu().numpy()[0, 0]
        return mask

    def analyze(self, image_path: str):
        try:
            preprocessed = preprocess_sar_image(image_path, target_size=(256, 256), apply_filter=True)
        except Exception as e:
            raise ValueError(f"Image preprocessing failed: {e}")

        mask = self._predict_mask(preprocessed)
        geometry = compute_spill_geometry(mask, pixel_resolution_m=10)

        if self.ready:
            confidence = float(np.max(mask)) * 100
        else:
            coverage = np.mean(mask > 0.5)
            confidence = min(95, 60 + coverage * 35)

        oil_prob = confidence
        lookalike_prob = max(0, 100 - confidence - 5)
        no_oil_prob = max(0, 100 - confidence - lookalike_prob)

        return {
            "confidence": round(confidence, 2),
            "oil_probability": round(oil_prob, 2),
            "lookalike_probability": round(lookalike_prob, 2),
            "no_oil_probability": round(no_oil_prob, 2),
            "area_km2": geometry["area_km2"],
            "perimeter_km": geometry["perimeter_km"],
            "width_km": geometry["width_km"],
            "length_km": geometry["length_km"],
            "centroid_lat": geometry.get("centroid_lat", 0),
            "centroid_lon": geometry.get("centroid_lon", 0),
            "orientation_deg": geometry.get("orientation_deg", 0),
            "mask": mask.tolist(),
            "mode": "live" if self.ready else "demo"
        }