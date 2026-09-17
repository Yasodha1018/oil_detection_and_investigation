"""
SAR image preprocessing for oil spill detection.
Includes radiometric calibration, speckle filtering, normalization, and resizing.
"""

import cv2
import numpy as np
from typing import Tuple, Optional

def read_sar_image(image_path: str) -> np.ndarray:
    from PIL import Image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        # Try with PIL
        try:
            pil_img = Image.open(image_path).convert('L')
            img = np.array(pil_img, dtype=np.float32)
        except Exception:
            raise ValueError(f"Could not read image: {image_path}")
    return img.astype(np.float32)

def apply_lee_filter(image: np.ndarray, window_size: int = 7) -> np.ndarray:
    """
    Apply Enhanced Lee filter for speckle suppression.
    window_size should be odd (e.g., 7).
    """
    if window_size % 2 == 0:
        window_size += 1
    pad = window_size // 2
    # Use local statistics
    mean = cv2.blur(image, (window_size, window_size))
    mean_sq = cv2.blur(image * image, (window_size, window_size))
    var = mean_sq - mean * mean
    # Estimate noise variance as mean of local variances over uniform areas
    # Simplified: use global variance as noise estimate
    global_var = np.var(image)
    # Lee filter formula
    k = var / (var + global_var + 1e-8)
    filtered = mean + k * (image - mean)
    return filtered

def normalize_image(image: np.ndarray, target_range: Tuple[float, float] = (0.0, 1.0)) -> np.ndarray:
    """
    Normalize image to target range using min-max scaling.
    """
    min_val = np.min(image)
    max_val = np.max(image)
    if max_val - min_val < 1e-8:
        return np.ones_like(image) * target_range[0]
    normalized = (image - min_val) / (max_val - min_val)
    normalized = normalized * (target_range[1] - target_range[0]) + target_range[0]
    return normalized

def preprocess_sar_image(image_path: str, target_size: Tuple[int, int] = (256, 256),
                         apply_filter: bool = True) -> np.ndarray:
    """
    Full preprocessing pipeline:
        - Read image
        - (Optional) Lee filter
        - Resize to target_size
        - Normalize to [0,1]
    Returns numpy array (height, width) float32.
    """
    img = read_sar_image(image_path)
    if apply_filter:
        img = apply_lee_filter(img)
    img = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)
    img = normalize_image(img, (0.0, 1.0))
    return img

def prepare_model_input(image: np.ndarray) -> np.ndarray:
    """
    Convert preprocessed image to model input shape (1, channels, height, width).
    Expects grayscale image; returns 3-channel by repeating.
    """
    if len(image.shape) == 2:
        image = np.stack([image] * 3, axis=2)  # (H, W, 3)
    # Convert to (C, H, W)
    image = np.transpose(image, (2, 0, 1))
    # Add batch dimension
    image = np.expand_dims(image, axis=0)
    return image.astype(np.float32)