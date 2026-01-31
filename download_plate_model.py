from ultralytics import YOLO
import os

def download_model():
    print("Downloading License Plate Detection Model...")
    # Using a known public model via Ultralytics naming convention or direct download
    # 'keremberke/yolov8n-license-plate' is available on HF but Ultralytics CLI handles it if name fits?
    # Actually simpler: load from hub directly or just download the weights.
    
    # We will try to load a model from the hub. If it works, it caches it.
    # However to be safe, let's explicitly use a huggingface repo if possible or just use 'yolov8n.pt' and hope?
    # No, 'yolov8n.pt' detects 'car' not 'plate'.
    
    # Let's try to simulate what user would do: download specific weights.
    # Since I cannot browse comfortably, I will use a direct code snippet that pulls from a reliable URL
    # or use the 'ultralytics' library feature if available.
    
    # Alternative: Use a generic small object detection model? No.
    
    # Let's use the ultralytics export/load feature.
    try:
        # This often works for public HUB models
        model = YOLO('https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt') 
        # Wait, that's generic.
        
        # We will try 'keremberke/yolov8m-license-plate' logic via HF Hub download
        # pip install huggingface_hub
        from huggingface_hub import hf_hub_download
        
        save_dir = os.path.join(os.getcwd(), "local_system", "models")
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
            
        print(f"Downloading to {save_dir}...")
        
        # Downloading 'keremberke/yolov8n-license-plate' specific weight file
        # Usually named 'best.pt' in their repo
        model_path = hf_hub_download(
            repo_id="keremberke/yolov8n-license-plate",
            filename="best.pt",
            local_dir=save_dir,
            local_dir_use_symlinks=False
        )
        
        # Rename to what config expects or update config
        new_path = os.path.join(save_dir, "yolov8n-license-plate.pt")
        if os.path.exists(new_path):
            os.remove(new_path)
            
        os.rename(model_path, new_path)
        print(f"Model saved to {new_path}")
        
    except Exception as e:
        print(f"Error downloading: {e}")

if __name__ == "__main__":
    download_model()
