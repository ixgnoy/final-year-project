import cv2
import easyocr
import re
import numpy as np
from config import PLATE_PATTERNS

class OCREngine:
    def __init__(self):
        # Initialize EasyOCR for English
        print("Initializing EasyOCR...")
        self.reader = easyocr.Reader(['en'], gpu=True) # Use GPU if available

    def preprocess_standard(self, img):
        """Standard preprocessing - resize and denoise."""
        # Resize to 2x for better resolution
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        return gray

    def preprocess_adaptive(self, img):
        """Adaptive thresholding for high contrast."""
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        # Adaptive threshold
        thresh = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY, 11, 2)
        return thresh

    def preprocess_otsu(self, img):
        """Otsu's thresholding for clear plates."""
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Gaussian blur to reduce noise
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        # Otsu's thresholding
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh

    def preprocess_morphology(self, img):
        """Morphological operations for noisy plates."""
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Bilateral filter (preserves edges)
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)
        # Edge detection to enhance characters
        edges = cv2.Canny(filtered, 30, 200)
        # Dilate to connect character edges
        kernel = np.ones((2, 2), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=1)
        return dilated

    def preprocess_invert(self, img):
        """Invert for dark plates with light text."""
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Check if plate is dark (mean intensity < 127)
        if np.mean(gray) < 127:
            gray = cv2.bitwise_not(gray)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        return enhanced

    def extract_text(self, plate_img):
        """
        Extracts text from the plate image using multiple preprocessing methods.
        """
        if plate_img is None or plate_img.size == 0:
            return ""

        # DEBUG: Save plate image for inspection
        try:
            cv2.imwrite("debug_plate.jpg", plate_img)
            print(f"DEBUG OCR: Saved plate image to debug_plate.jpg (size: {plate_img.shape})")
        except:
            pass

        # Try multiple preprocessing methods
        preprocessing_methods = [
            ("adaptive", self.preprocess_adaptive),
            ("invert", self.preprocess_invert),
            ("otsu", self.preprocess_otsu),
            ("standard", self.preprocess_standard),
            ("morphology", self.preprocess_morphology),
        ]

        best_text = ""
        best_confidence = 0

        for method_name, preprocess_func in preprocessing_methods:
            try:
                processed_img = preprocess_func(plate_img)
                
                # Save debug images
                cv2.imwrite(f"debug_plate_{method_name}.jpg", processed_img)
                
                # Read with detailed output for confidence
                results = self.reader.readtext(processed_img, detail=1)
                
                if results:
                    # Calculate average confidence and concatenate text
                    texts = []
                    total_conf = 0
                    for bbox, text, conf in results:
                        texts.append(text)
                        total_conf += conf
                    
                    avg_conf = total_conf / len(results)
                    full_text = "".join(texts)
                    cleaned = self.clean_text(full_text)
                    
                    print(f"DEBUG OCR [{method_name}]: Found '{cleaned}' with confidence {avg_conf:.2f}")
                    
                    # Keep the best result (highest confidence with valid format)
                    if avg_conf > best_confidence and len(cleaned) >= 3:
                        best_text = cleaned
                        best_confidence = avg_conf
                        
            except Exception as e:
                print(f"DEBUG OCR [{method_name}]: Error - {e}")
                continue

        # If no good results, try original image directly
        if not best_text or best_confidence < 0.3:
            print("DEBUG OCR: Trying original image...")
            try:
                results = self.reader.readtext(plate_img, detail=1)
                if results:
                    texts = [text for _, text, _ in results]
                    full_text = "".join(texts)
                    cleaned = self.clean_text(full_text)
                    if len(cleaned) >= 3:
                        best_text = cleaned
                        print(f"DEBUG OCR [original]: Found '{cleaned}'")
            except:
                pass

        print(f"DEBUG OCR: Final result: '{best_text}' (confidence: {best_confidence:.2f})")
        return best_text

    def clean_text(self, text):
        """
        Removes non-alphanumeric characters and converts to uppercase.
        Also fixes common OCR mistakes.
        """
        # Common OCR substitutions
        text = text.upper()
        text = text.replace('O', '0').replace('0', 'O', 1)  # First char usually letter
        text = text.replace('I', '1').replace('L', '1')
        text = text.replace('S', '5').replace('Z', '2')
        text = text.replace('B', '8').replace('G', '6')
        
        # Actually, be more careful - only substitute in number positions
        # For now, just clean
        cleaned = re.sub(r'[^A-Z0-9]', '', text.upper())
        
        # Revert - don't auto-substitute, let the original stand
        cleaned = re.sub(r'[^A-Z0-9]', '', text.upper().replace('0', 'O').replace('1', 'I'))
        
        # Just basic cleaning
        cleaned = re.sub(r'[^A-Z0-9]', '', text)
        
        return cleaned

    def validate_plate(self, text):
        """
        Checks if the text matches Malaysian plate patterns.
        More lenient validation.
        """
        # Basic length check (2-9 characters)
        if not (2 <= len(text) <= 10):
            return False
        
        # Must contain at least one letter and one number
        has_letter = bool(re.search(r'[A-Z]', text))
        has_number = bool(re.search(r'[0-9]', text))
        
        if not (has_letter and has_number):
            return False
        
        # Very lenient validation - just check it's reasonable length
        # and has mix of letters and numbers
        # Malaysian plates can have various formats: ABC1234, W123ABC, etc.
        
        # Accept any alphanumeric string between 3-10 chars with letters and numbers
        return True
