import cv2
import numpy as np
import os
# Force legacy keras for Teachable Machine models
os.environ["TF_USE_LEGACY_KERAS"] = "1"
import tensorflow as tf
import tf_keras as keras 
from tf_keras.models import load_model
import config

class VehicleClassifier:
    def __init__(self):
        print("Loading Vehicle Classification Models...")
        print(f"DEBUG: Color Path: {config.COLOR_MODEL_PATH}")
        print(f"DEBUG: Make Path: {config.MAKE_MODEL_PATH}")
        
        try:
            self.color_model = load_model(config.COLOR_MODEL_PATH)
            self.make_model = load_model(config.MAKE_MODEL_PATH)
            
            # Load Labels
            color_label_path = config.COLOR_MODEL_PATH.replace('keras_model.h5', 'labels.txt')
            make_label_path = config.MAKE_MODEL_PATH.replace('keras_model.h5', 'labels.txt')
            
            self.color_labels = self.load_labels(color_label_path)
            self.make_labels = self.load_labels(make_label_path)
            
            print(f"DEBUG: Color Labels Loaded: {self.color_labels}")
            print(f"DEBUG: Make Labels Loaded: {self.make_labels}")
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")
            import traceback
            traceback.print_exc()
            self.color_model = None
            self.make_model = None
            self.color_labels = []
            self.make_labels = []

    def load_labels(self, path):
        try:
            with open(path, 'r') as f:
                # Teachable Machine labels often look like "0 ClassName" or just "ClassName"
                # We need to strip the index if present
                labels = []
                for line in f.readlines():
                    parts = line.strip().split(' ', 1)
                    if len(parts) > 1 and parts[0].isdigit():
                        labels.append(parts[1])
                    else:
                        labels.append(line.strip())
                return labels
        except Exception as e:
            print(f"Warning: Could not load labels from {path}: {e}")
            return []

    def preprocess(self, image):
        img = cv2.resize(image, (224, 224))
        # Teachable Machine Standard Image Model uses (Image / 127.5) - 1
        img = (np.asarray(img, dtype=np.float32) / 127.5) - 1.0
        img = np.expand_dims(img, axis=0)
        return img

    def predict_color(self, image):
        if not self.color_model:
            return "Unknown (No Model)", 0.0
        
        try:
            processed = self.preprocess(image)
            prediction = self.color_model.predict(processed, verbose=0)
            idx = np.argmax(prediction)
            confidence = prediction[0][idx]
            
            print(f"DEBUG: Color Raw Pred: {prediction} -> Idx: {idx}")
            
            if idx < len(self.color_labels):
                label = self.color_labels[idx]
            else:
                label = f"Index {idx}"
                
            return label, float(confidence)
        except Exception as e:
            print(f"Color prediction error: {e}")
            return "Error", 0.0

    def predict_make(self, image):
        if not self.make_model:
            return "Unknown (No Model)", 0.0
            
        try:
            processed = self.preprocess(image)
            prediction = self.make_model.predict(processed, verbose=0)
            idx = np.argmax(prediction)
            confidence = prediction[0][idx]
            
            print(f"DEBUG: Make Raw Pred: {prediction} -> Idx: {idx}")
            
            if idx < len(self.make_labels):
                label = self.make_labels[idx]
            else:
                label = f"Index {idx}"
                
            return label, float(confidence)
        except Exception as e:
            print(f"Make prediction error: {e}")
            return "Error", 0.0
