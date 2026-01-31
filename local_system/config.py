import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Camera
CAMERA_INDEX = 0  # Default camera
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720

# Recognition
PLATE_DETECTION_MODEL = os.path.join(PROJECT_ROOT, "yolov11-license-plate-detection", "license-plate-finetune-v1n.pt")
PLATE_CONFIDENCE = 0.3  # Lowered for better detection
MATCH_THRESHOLD = 0.5
PLATE_PATTERNS = [
    r'^[A-Z]{1,3}\d{1,4}[A-Z]{0,2}$', # General approximation, refined in regex logic
]

# Paths
MAKE_MODEL_PATH = os.path.join(PROJECT_ROOT, "car-model-recog", "keras_model.h5")
COLOR_MODEL_PATH = os.path.join(PROJECT_ROOT, "converted_keras (1)", "keras_model.h5")
