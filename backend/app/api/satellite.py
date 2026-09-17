import traceback
import tempfile
import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from ..ml.inference import get_detector

router = APIRouter()  # ✅ Define router
detector = get_detector()


@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are allowed")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = detector.analyze(tmp_path)
        result["mode"] = "live" if detector.ready else "demo"
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Analysis failed: {str(e)}")
    finally:
        os.unlink(tmp_path)