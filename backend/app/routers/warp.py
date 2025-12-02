from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import cv2
import numpy as np
import base64

router = APIRouter()

class WarpRequest(BaseModel):
    contentImageUrl: str
    homography: List[float]
    outputWidth: int
    outputHeight: int

@router.post("/warp")
async def warp_image(req: WarpRequest):
    try:
        # Decode content image
        if "," in req.contentImageUrl:
            _, encoded = req.contentImageUrl.split(",", 1)
        else:
            encoded = req.contentImageUrl
            
        data = base64.b64decode(encoded)
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"warpedImageUrl": req.contentImageUrl}

        # Construct Homography matrix
        H = np.array(req.homography).reshape(3, 3)

        # Warp
        warped = cv2.warpPerspective(img, H, (req.outputWidth, req.outputHeight))

        # Encode back to base64
        _, buffer = cv2.imencode(".png", warped)
        b64_str = base64.b64encode(buffer).decode("utf-8")
        
        return {"warpedImageUrl": f"data:image/png;base64,{b64_str}"}
    except Exception as e:
        print(f"Warp error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
