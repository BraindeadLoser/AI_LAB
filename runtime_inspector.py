import os, subprocess, time

APP_DIR = r"D:\AI_LAB"
FILES = {
    "main.js": os.path.join(APP_DIR, "main.js"),
    "index.html": os.path.join(APP_DIR, "Bone_Code", "html", "index.html"),
    "preload.js": os.path.join(APP_DIR, "preload.js"),
    "renderer.js": os.path.join(APP_DIR, "Bone_Code", "js", "renderer.js"),
    "file_access.js": os.path.join(APP_DIR, "Bone_Code", "js", "Fetch_Files", "file_access.js"),
}

def check_files():
    print("=== File existence check ===")
    for name, path in FILES.items():
        print(f"{name}: {os.path.exists(path)} -> {path}")
    print("\n=== Quick content scan ===")
    for name, path in FILES.items():
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as f:
                content = f.read()
            if "lines.slice" in content and "const lines" not in content:
                print(f"⚠ {name} uses 'lines.slice' but never defines 'lines'")
            if "ipcRenderer.invoke" in content and "ipcMain.handle" not in open(FILES["main.js"], encoding="utf-8", errors="ignore").read():
                print(f"⚠ {name} invokes IPC but no handler found in main.js")

def run_app():
    electron_bin = os.path.join(APP_DIR, "node_modules", ".bin", "electron.cmd")
    print("\n=== Launching Electron app ===")
    try:
        proc = subprocess.Popen(
            [electron_bin, "."],
            cwd=APP_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        # stream logs live for 20 seconds
        start = time.time()
        while time.time() - start < 20:
            line = proc.stdout.readline()
            errline = proc.stderr.readline()
            if line:
                print("STDOUT>", line.strip())
            if errline:
                print("STDERR>", errline.strip())
            if proc.poll() is not None:
                break
        proc.terminate()
    except Exception as e:
        print(f"Inspector error: {e}")

if __name__ == "__main__":
    check_files()
    run_app()
