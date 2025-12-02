from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import base64
from app.services.sam_service import sam_service
from pydantic import BaseModel

router = APIRouter()

class SegmentRequest(BaseModel):
    image: str # base64

@router.post("/segment")
async def segment_image(req: SegmentRequest):
    try:
        # Decode base64
        if "," in req.image:
            _, encoded = req.image.split(",", 1)
        else:
            encoded = req.image
        
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        masks = sam_service.segment_image(img)
        return {"masks": masks}
    except Exception as e:
        print(f"Segment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
