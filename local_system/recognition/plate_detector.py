import cv2
import numpy as np
import os
from ultralytics import YOLO
from config import PLATE_DETECTION_MODEL as PLATE_MODEL_PATH, PLATE_CONFIDENCE

class PlateDetector:
    def __init__(self):
        self.model = None
        self.use_yolo = False
        
        # Try to load YOLO model
        if os.path.exists(PLATE_MODEL_PATH):
            try:
                print(f"Loading YOLO model from {PLATE_MODEL_PATH}...")
                self.model = YOLO(PLATE_MODEL_PATH)
                self.use_yolo = True
            except Exception as e:
                print(f"Failed to load YOLO model: {e}")
        else:
            print(f"YOLO model not found at {PLATE_MODEL_PATH}. Attempting download or using fallback.")
            # Note: YOLO() constructor can auto-download standard models, 
            # but for custom trained ones we need the file.
            # We'll default to standard 'yolov8n.pt' or similar if specific one missing? 
            # For now, if missing, we go to fallback.

    def detect_plate(self, img):
        """
        Returns the cropped plate image.
        """
        if self.use_yolo:
            return self.detect_plate_yolo(img)
        else:
            print("Using fallback CV detection.")
            return self.detect_plate_traditional(img)

    def detect_plate_yolo(self, img):
        results = self.model(img, conf=PLATE_CONFIDENCE)
        
        for result in results:
            boxes = result.boxes
            if len(boxes) > 0:
                # Get highest confidence box
                # Assuming class 0 is plate (standard for single-class models)
                box = boxes[0] 
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                # Crop
                plate_img = img[y1:y2, x1:x2]
                return plate_img
                
        # If nothing found by YOLO, try fallback?
        return self.detect_plate_traditional(img)

    def detect_plate_traditional(self, img):
        """
        Fallback method using Haar Cascade (Better than contours).
        """
        print("Running Haar Cascade Detection...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Load Haar Cascade
        # Russian plate cascade works surprisingly well for general rectangular plates
        haar_path = cv2.data.haarcascades + 'haarcascade_russian_plate_number.xml'
        
        if not os.path.exists(haar_path):
             print(f"Haar cascade not found at {haar_path}")
             return None
             
        plate_cascade = cv2.CascadeClassifier(haar_path)
        
        # Try multiple parameter combinations for better detection
        param_sets = [
            {'scaleFactor': 1.1, 'minNeighbors': 3},  # Standard
            {'scaleFactor': 1.05, 'minNeighbors': 2}, # More sensitive
            {'scaleFactor': 1.2, 'minNeighbors': 4},  # Less sensitive but more accurate
        ]
        
        plates = []
        for params in param_sets:
            plates = plate_cascade.detectMultiScale(gray, **params)
            if len(plates) > 0:
                print(f"Detected with params: {params}")
                break
        
        if len(plates) > 0:
            # Take the largest plate found
            plates = sorted(plates, key=lambda x: x[2] * x[3], reverse=True)
            x, y, w, h = plates[0]
            
            # Simple validation on aspect ratio (2 to 6)
            aspect = w / float(h)
            if 2 <= aspect <= 6:
                print(f"Haar detected plate at {x},{y} {w}x{h}")
                
                # Add padding around the plate for better OCR (20% on each side)
                img_height, img_width = img.shape[:2]
                pad_w = int(w * 0.2)
                pad_h = int(h * 0.2)
                
                # Calculate padded coordinates with bounds checking
                x1 = max(0, x - pad_w)
                y1 = max(0, y - pad_h)
                x2 = min(img_width, x + w + pad_w)
                y2 = min(img_height, y + h + pad_h)
                
                plate_img = img[y1:y2, x1:x2]
                print(f"Padded plate region: {x1},{y1} to {x2},{y2} (size: {x2-x1}x{y2-y1})")
                return plate_img
        
        print("Haar detection failed.")
        return None
