import cv2
import tkinter as tk
from tkinter import simpledialog, messagebox, filedialog
import threading
import time
from database import get_registered_vehicles, check_vehicle_access, log_access_attempt
from recognition.plate_detector import PlateDetector
from recognition.ocr_engine import OCREngine
from recognition.vehicle_classifier import VehicleClassifier
from ui import GateUI
from config import BASE_DIR
from PIL import Image, ImageTk

class ANPRSystem:
    def __init__(self):
        self.root = tk.Tk()
        self.ui = GateUI(self.root, on_reset_callback=self.reset_system)
        
        # Initialize modules
        print("Initializing Logic Modules...")
        self.plate_detector = PlateDetector()
        self.ocr_engine = OCREngine()
        self.vehicle_classifier = VehicleClassifier()
        
        # Sync simple database cache
        self.registered_vehicles = get_registered_vehicles()
        print(f"Loaded {len(self.registered_vehicles) if self.registered_vehicles else 0} registered vehicles.")
        
        # Track image window for cleanup
        self.image_window = None

    def upload_image(self):
        file_path = filedialog.askopenfilename(
            title="Select Vehicle Image",
            filetypes=[("Image files", "*.jpg *.jpeg *.png *.bmp")]
        )
        
        if not file_path:
            return
            
        print(f"Processing image: {file_path}")
        
        # Read image using cv2 for processing
        frame = cv2.imread(file_path)
        if frame is None:
            messagebox.showerror("Error", "Could not read image file.")
            return

        # Reset UI to clear previous results
        self.ui.reset_ui()

        # Display image in the UI panel
        rgb_img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_img)
        self.ui.update_image(pil_img)
        
        # Run processing
        threading.Thread(target=self.process_image, args=(frame,)).start()

    def show_image_window(self, cv_img, title):
        """Displays a CV2 image in a Tkinter window"""
        # Close previous image window if it exists
        if self.image_window and self.image_window.winfo_exists():
            self.image_window.destroy()
        
        # Convert CV image (BGR) to RGB
        rgb_img = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_img)
        
        # Resize to fit screen if huge
        pil_img.thumbnail((800, 600))
        
        tk_img = ImageTk.PhotoImage(pil_img)
        
        self.image_window = tk.Toplevel(self.root)
        self.image_window.title(title)
        
        lbl = tk.Label(self.image_window, image=tk_img)
        lbl.image = tk_img # Keep reference
        lbl.pack()

    def process_image(self, frame):
        # 1. Detect Plate
        plate_img = self.plate_detector.detect_plate(frame)
        
        if plate_img is not None:
             # Show plate in UI (optional, can be done similar to show_image_window)
             # self.root.after(0, lambda: self.show_image_window(plate_img, "Detected Plate"))
            
            plate_text = self.ocr_engine.extract_text(plate_img)
            valid_plate = self.ocr_engine.validate_plate(plate_text)
            
            print(f"OCR Raw: {plate_text} (Valid: {valid_plate})")
            
            # If OCR failed or returned invalid plate, allow manual entry
            if not plate_text or not valid_plate:
                manual_plate = simpledialog.askstring(
                    "Manual Plate Entry",
                    "OCR could not read the plate.\nPlease enter the plate number manually:",
                    parent=self.root
                )
                if manual_plate:
                    plate_text = manual_plate.strip().upper()
                    print(f"Manual entry: {plate_text}")
                else:
                    print("User cancelled manual entry.")
                    return
            
            # 3. Classify Attributes
            color, color_conf = self.vehicle_classifier.predict_color(frame)
            make, make_conf = self.vehicle_classifier.predict_make(frame)
            
            print(f"Attributes: {color} ({color_conf:.2f}), {make} ({make_conf:.2f})")
            
            # 4. Check Access
            access, msg, color_warning = check_vehicle_access(plate_text, color, make)
            
            # 5. Log access attempt to Supabase
            log_access_attempt(
                plate_number=plate_text,
                detected_color=color,
                detected_model=make,
                plate_matched=access,
                color_matched=not color_warning
            )
            
            # Update UI
            self.root.after(0, lambda: self.ui.update_info(plate_text, color, make, msg, access, color_warning))
            
        else:
            print("No plate detected.")
            self.root.after(0, lambda: messagebox.showinfo("Result", "No license plate detected in this image."))

    def reset_system(self):
        # Cleaup if needed
        pass

    def run(self):
        # Add "Upload Image" button with professional styling
        upload_btn = tk.Button(
            self.root, 
            text="📁 Upload Vehicle Image", 
            command=self.upload_image,
            font=("Segoe UI", 14, "bold"),
            bg="#00d4ff",
            fg="#1a1a2e",
            activebackground="#00a8cc",
            activeforeground="#1a1a2e",
            relief="flat",
            padx=30,
            pady=15,
            cursor="hand2"
        )
        upload_btn.pack(pady=20)
        
        self.root.mainloop()
        
        # Cleanup
        cv2.destroyAllWindows()

if __name__ == "__main__":
    app = ANPRSystem()
    app.run()
