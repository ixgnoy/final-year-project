"""
Download YOLOv11 License Plate Detection Model from Hugging Face
Source: https://huggingface.co/morsetechlab/yolov11-license-plate-detection
"""

import os
import requests
from pathlib import Path

MODEL_URL = "https://huggingface.co/morsetechlab/yolov11-license-plate-detection/resolve/main/yolov11n-license-plate.pt"
MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "yolov11n-license-plate.pt"

def download_model():
    """Download the YOLOv11 license plate detection model."""
    # Create models directory if it doesn't exist
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    if MODEL_PATH.exists():
        print(f"✅ Model already exists at: {MODEL_PATH}")
        return str(MODEL_PATH)
    
    print(f"📥 Downloading YOLOv11 License Plate Detection model...")
    print(f"   Source: {MODEL_URL}")
    print(f"   Destination: {MODEL_PATH}")
    
    try:
        response = requests.get(MODEL_URL, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\r   Progress: {percent:.1f}% ({downloaded / 1024 / 1024:.1f} MB)", end="")
        
        print(f"\n✅ Model downloaded successfully!")
        return str(MODEL_PATH)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to download model: {e}")
        return None

if __name__ == "__main__":
    download_model()
