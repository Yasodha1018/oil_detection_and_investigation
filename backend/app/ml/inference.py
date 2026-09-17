from .detector import OilSpillDetector

# Singleton instance
_detector = None

def get_detector() -> OilSpillDetector:
    global _detector
    if _detector is None:
        _detector = OilSpillDetector()
    return _detector