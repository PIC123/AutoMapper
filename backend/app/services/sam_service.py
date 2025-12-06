import numpy as np
import os
import torch
from typing import List, Dict
import cv2
import sys

# Support for both SAM 1 and SAM 2
SAM_VERSION = None

try:
    from sam2.build_sam import build_sam2
    from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator
    SAM_VERSION = 2
    print("SAM 2 library detected.")
except ImportError:
    try:
        from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
        SAM_VERSION = 1
        print("SAM 1 library detected.")
    except ImportError:
        print("No SAM library detected. Using dummy mode.")

class SAMService:
    def __init__(self):
        self.mask_generator = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"SAM Service using device: {self.device}")
        
        # Allow CPU fallback for SAM 2 (it supports it better than SAM 1 usually)
        if self.device == "cpu":
            print("Warning: Running on CPU. Inference might be slow.")

        self.load_model()

    def load_model(self):
        if not SAM_VERSION:
            return

        loaded = False
        if SAM_VERSION == 2:
            loaded = self._load_sam2()
        
        # Fallback to SAM 1 if SAM 2 failed or not present (and we somehow detected SAM 2 lib)
        if not loaded:
            print("Trying fallback to SAM 1...")
            self._load_sam1()

    def _load_sam2(self) -> bool:
        # SAM 2 Configurations
        # ... (rest of config map)
        models = {
            "sam2_hiera_large.pt": "sam2_hiera_l.yaml",
            "sam2_hiera_base_plus.pt": "sam2_hiera_b+.yaml",
            "sam2_hiera_small.pt": "sam2_hiera_s.yaml",
            "sam2_hiera_tiny.pt": "sam2_hiera_t.yaml"
        }

        checkpoint_path = None
        config_name = None

        for cp, cfg in models.items():
            if os.path.exists(cp):
                checkpoint_path = cp
                config_name = cfg
                break
        
        if not checkpoint_path:
            print("No SAM 2 checkpoint found. Please download one (e.g., sam2_hiera_large.pt).")
            return False

        try:
            print(f"Loading SAM 2 from {checkpoint_path} with config {config_name}...")
            sam = build_sam2(config_name, checkpoint_path, device=self.device, apply_postprocessing=False)
            self.mask_generator = SAM2AutomaticMaskGenerator(sam)
            print("SAM 2 Model loaded successfully.")
            return True
        except Exception as e:
            print(f"Failed to load SAM 2 model: {e}")
            print("Ensure the yaml config is accessible or installed with the package.")
            return False

    def _load_sam1(self):
        checkpoints = [
            "sam_vit_h_4b8939.pth",
            "sam_vit_l_0b3195.pth",
            "sam_vit_b_01ec64.pth"
        ]
        
        checkpoint_path = None
        model_type = None

        for cp in checkpoints:
            if os.path.exists(cp):
                checkpoint_path = cp
                if "vit_h" in cp: model_type = "vit_h"
                if "vit_l" in cp: model_type = "vit_l"
                if "vit_b" in cp: model_type = "vit_b"
                break
        
        if not checkpoint_path:
            print("No SAM 1 checkpoint found.")
            return

        try:
            print(f"Loading SAM 1 ({model_type}) from {checkpoint_path}...")
            sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
            sam.to(device=self.device)
            self.mask_generator = SamAutomaticMaskGenerator(sam)
            print("SAM 1 Model loaded successfully.")
        except Exception as e:
            print(f"Failed to load SAM 1 model: {e}")

    def segment_image(self, image: np.ndarray) -> List[Dict]:
        if self.mask_generator is not None:
            # Real Inference
            # image is BGR from OpenCV, SAM expects RGB
            image_rgb = image[..., ::-1] # BGR to RGB
            
            masks = self.mask_generator.generate(image_rgb)
            
            # SAM 1 and SAM 2 both return list of dicts with 'segmentation', 'area', etc.
            # Format is compatible.
            
            results = []
            for i, m in enumerate(masks):
                # m['segmentation'] is boolean mask
                mask_uint8 = (m['segmentation'] * 255).astype(np.uint8)
                contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                for contour in contours:
                    epsilon = 0.005 * cv2.arcLength(contour, True)
                    approx = cv2.approxPolyDP(contour, epsilon, True)
                    
                    if len(approx) < 3: continue
                    
                    points = [{"x": int(p[0][0]), "y": int(p[0][1])} for p in approx]
                    
                    results.append({
                        "id": f"seg-{i}",
                        "polygon": points,
                        "area": float(m['area'])
                    })
            
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
