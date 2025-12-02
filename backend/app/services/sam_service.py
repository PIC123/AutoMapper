import numpy as np
import os
import torch
from typing import List, Dict
import cv2

# Try to import segment_anything
try:
    from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
    SAM_AVAILABLE = True
except ImportError:
    SAM_AVAILABLE = False
    print("Segment Anything not installed. Using dummy mode.")

class SAMService:
    def __init__(self):
        self.mask_generator = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model()

    def load_model(self):
        if not SAM_AVAILABLE:
            return

        # Look for model in current directory or /app (docker)
        checkpoint_path = "sam_vit_b_01ec64.pth"
        if not os.path.exists(checkpoint_path):
             # Try absolute path for Docker if needed, or just warn
             checkpoint_path = "/app/sam_vit_b_01ec64.pth"
        
        model_type = "vit_b"
        
        if not os.path.exists(checkpoint_path):
            print(f"Checkpoint {checkpoint_path} not found. Running in dummy mode.")
            return

        try:
            print(f"Loading SAM model from {checkpoint_path}...")
            sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
            sam.to(device=self.device)
            # Using AutomaticMaskGenerator for the "Multi-Surface" detection
            self.mask_generator = SamAutomaticMaskGenerator(sam)
            print("SAM Model loaded successfully.")
        except Exception as e:
            print(f"Failed to load SAM model: {e}")

    def segment_image(self, image: np.ndarray) -> List[Dict]:
        if self.mask_generator is not None:
            # Real Inference
            # image is BGR from OpenCV, SAM expects RGB
            image_rgb = image[..., ::-1] # BGR to RGB
            
            masks = self.mask_generator.generate(image_rgb)
            
            # Convert to our API format
            results = []
            for i, m in enumerate(masks):
                # m['segmentation'] is boolean mask
                # Find contours
                mask_uint8 = (m['segmentation'] * 255).astype(np.uint8)
                contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                for contour in contours:
                    # Simplify contour
                    epsilon = 0.005 * cv2.arcLength(contour, True)
                    approx = cv2.approxPolyDP(contour, epsilon, True)
                    
                    if len(approx) < 3: continue
                    
                    # Convert to Point list
                    points = [{"x": int(p[0][0]), "y": int(p[0][1])} for p in approx]
                    
                    results.append({
                        "id": f"seg-{i}",
                        "polygon": points,
                        "area": float(m['area'])
                    })
            
            # Filter small areas
            results = [r for r in results if r['area'] > 1000]
            return results

        else:
            # Dummy Fallback
            height, width = image.shape[:2]
            margin = 50
            x1, y1 = margin, margin
            x2, y2 = width - margin, height - margin
            
            polygon = [
                {"x": x1, "y": y1},
                {"x": x2, "y": y1},
                {"x": x2, "y": y2},
                {"x": x1, "y": y2}
            ]
            
            return [{
                "id": "segment-dummy-real",
                "polygon": polygon,
                "area": (x2-x1)*(y2-y1)
            }]

sam_service = SAMService()
