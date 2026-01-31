import tkinter as tk
from tkinter import ttk, messagebox
from threading import Thread
import time

class GateUI:
    def __init__(self, root, on_reset_callback=None):
        self.root = root
        self.root.title("ANPR Gate Control System")
        self.root.geometry("1200x600")
        self.root.configure(bg="#1a1a2e")
        
        self.on_reset_callback = on_reset_callback
        
        # Styles
        style = ttk.Style()
        style.theme_use('clam')
        
        # Header Section
        header_frame = tk.Frame(root, bg="#16213e", height=80)
        header_frame.pack(fill="x", pady=0)
        header_frame.pack_propagate(False)
        
        self.header = tk.Label(
            header_frame, 
            text="🚗 VEHICLE ACCESS CONTROL SYSTEM", 
            font=("Segoe UI", 20, "bold"),
            bg="#16213e",
            fg="#00d4ff"
        )
        self.header.pack(pady=20)
        
        # Main container with left and right panels
        main_container = tk.Frame(root, bg="#1a1a2e")
        main_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        # LEFT PANEL - Image Display
        left_panel = tk.Frame(main_container, bg="#0f1419", width=500, relief="solid", borderwidth=2)
        left_panel.pack(side="left", fill="both", expand=True, padx=(0, 10))
        left_panel.pack_propagate(False)
        
        # Image label
        self.lbl_image = tk.Label(
            left_panel,
            text="📷\n\nNo Image Loaded",
            font=("Segoe UI", 16),
            bg="#0f1419",
            fg="#666666"
        )
        self.lbl_image.pack(fill="both", expand=True)
        
        # RIGHT PANEL - Information Display
        right_panel = tk.Frame(main_container, bg="#1a1a2e")
        right_panel.pack(side="right", fill="both", expand=True)
        
        # Info Frame
        self.info_frame = tk.Frame(right_panel, bg="#1a1a2e", pady=20)
        self.info_frame.pack(fill="both", expand=True)
        
        # Plate Number Display (Large and prominent)
        self.lbl_plate = tk.Label(
            self.info_frame, 
            text="--",
            font=("Segoe UI", 36, "bold"),
            bg="#1a1a2e",
            fg="#ffffff"
        )
        self.lbl_plate.pack(pady=10)
        
        # Vehicle Model Display
        self.lbl_model = tk.Label(
            self.info_frame, 
            text="Vehicle Model: --",
            font=("Segoe UI", 16),
            bg="#1a1a2e",
            fg="#b0b0b0"
        )
        self.lbl_model.pack(pady=5)
        
        # Gate Status Frame
        status_frame = tk.Frame(right_panel, bg="#1a1a2e", height=120)
        status_frame.pack(fill="x", pady=20)
        status_frame.pack_propagate(False)
        
        self.lbl_gate_status = tk.Label(
            status_frame,
            text="GATE: STANDBY",
            font=("Segoe UI", 28, "bold"),
            bg="#1a1a2e",
            fg="#ffa500"
        )
        self.lbl_gate_status.pack(pady=10)
        
        # Warning/Message Display
        self.lbl_warning = tk.Label(
            status_frame,
            text="",
            font=("Segoe UI", 12),
            bg="#1a1a2e",
            fg="#ffcc00",
            wraplength=500
        )
        self.lbl_warning.pack(pady=5)
        
        # Button Frame
        btn_frame = tk.Frame(root, bg="#1a1a2e")
        btn_frame.pack(fill="x", pady=10)
        
        # Reset Button
        self.btn_reset = tk.Button(
            btn_frame, 
            text="🔄 Reset System", 
            command=self.reset_ui,
            font=("Segoe UI", 12),
            bg="#444",
            fg="white",
            activebackground="#666",
            activeforeground="white",
            relief="flat",
            padx=20,
            pady=10,
            cursor="hand2"
        )
        self.btn_reset.pack(pady=10)
        
    def update_image(self, pil_image):
        """Update the displayed vehicle image"""
        from PIL import ImageTk
        
        # Resize image to fit the panel while maintaining aspect ratio
        pil_image.thumbnail((480, 400))
        
        tk_image = ImageTk.PhotoImage(pil_image)
        
        self.lbl_image.config(image=tk_image, text="")
        self.lbl_image.image = tk_image  # Keep reference
        
    def update_info(self, plate, color, model, status, access_granted, color_warning=False):
        # Update plate number
        self.lbl_plate.config(text=plate)
        
        # Update model
        self.lbl_model.config(text=f"Vehicle Model: {model}")
        
        # Update gate status and styling
        if access_granted:
            self.lbl_gate_status.config(
                text="🟢 GATE: OPEN",
                fg="#00ff00"
            )
            self.root.configure(bg="#0d3d0d")
            self.info_frame.configure(bg="#0d3d0d")
            
            # Show color warning if present
            if color_warning:
                self.lbl_warning.config(
                    text=f"⚠️ Warning: {status}",
                    fg="#ffcc00"
                )
            else:
                self.lbl_warning.config(
                    text=f"✓ {status}",
                    fg="#00ff00"
                )
        else:
            self.lbl_gate_status.config(
                text="🔴 GATE: CLOSED",
                fg="#ff0000"
            )
            self.root.configure(bg="#3d0d0d")
            self.info_frame.configure(bg="#3d0d0d")
            
            # Show denial reason
            self.lbl_warning.config(
                text=f"❌ Access Denied: {status}",
                fg="#ff6666"
            )
            
    def show_popup(self, title, message):
        messagebox.showinfo(title, message)
        
    def reset_ui(self):
        self.lbl_plate.config(text="--")
        self.lbl_model.config(text="Vehicle Model: --")
        self.lbl_gate_status.config(text="GATE: STANDBY", fg="#ffa500")
        self.lbl_warning.config(text="")
        self.lbl_image.config(image="", text="📷\n\nNo Image Loaded")
        self.root.configure(bg="#1a1a2e")
        self.info_frame.configure(bg="#1a1a2e")
        
        if self.on_reset_callback:
            self.on_reset_callback()
