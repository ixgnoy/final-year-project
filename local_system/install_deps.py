import subprocess
import sys
import os

LOG_FILE = "install_log.txt"

def run_command(command):
    with open(LOG_FILE, "a") as f:
        f.write(f"\n\n--- Running: {command} ---\n")
        f.flush()
        try:
            result = subprocess.run(
                command,
                shell=True,
                check=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            f.write(result.stdout)
            f.flush()
            return result.returncode
        except Exception as e:
            f.write(f"Error executing command: {e}\n")
            return 1

def main():
    # clear log
    with open(LOG_FILE, "w") as f:
        f.write("Starting installation process...\n")
    
    # 1. Check environments
    run_command("python --version")
    run_command("pip --version")
    
    # 2. Upgrade build tools
    run_command("python -m pip install --upgrade pip setuptools wheel")
    
    # 3. Try to find scikit-image binary
    print("Attempting strict binary install...")
    ret = run_command("python -m pip install scikit-image --only-binary :all:")
    
    if ret != 0:
        print("Strict binary install failed. Trying specific version 0.22.0...")
        ret = run_command("python -m pip install scikit-image==0.22.0 --only-binary :all:")
        
    if ret != 0:
        print("Version 0.22.0 failed. Trying 0.21.0...")
        run_command("python -m pip install scikit-image==0.21.0 --only-binary :all:")

    # 4. Install other deps with constraints
    print("Installing other dependencies with constraints...")
    # We force scikit-image to stay high to avoid backtracking to 0.21.0 which fails to build
    run_command("python -m pip install \"scikit-image>=0.25.0\" ultralytics easyocr tensorflow tensorflowjs supabase opencv-python customtkinter --only-binary scikit-image,numpy,scipy,pandas,matplotlib,pillow")
    
    # 5. Check installation
    run_command("pip list")
    
    print("Done. Check install_log.txt")

if __name__ == "__main__":
    main()
