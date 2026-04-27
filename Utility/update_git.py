import subprocess
from datetime import datetime
from pathlib import Path

IGNORED_PATHS = ["venv", "node_modules"]
STRUCTURE_SCRIPT = r"D:\AI_LAB\Utility\structure.py"
FILE_TREE_PATH = Path(r"D:\AI_LAB\Structure\file_tree.txt")

def run(cmd):
    return subprocess.run(cmd, shell=True, text=True, capture_output=True)

def has_changes():
    return run("git status --porcelain").stdout.strip() != ""

def get_tracked_paths():
    if not FILE_TREE_PATH.exists():
        print("file_tree.txt not found, defaulting to full add.")
        return ["."]
    with FILE_TREE_PATH.open("r") as f:
        lines = [line.strip() for line in f if line.strip()]
    paths = []
    for line in lines:
        if line.startswith("├──") or line.startswith("└──"):
            path = line.replace("├──", "").replace("└──", "").strip()
            if path and path not in IGNORED_PATHS:
                paths.append(path)
    return paths if paths else ["."]

def main():
    print("Running structure.py to refresh file_tree.txt...")
    run(f"python \"{STRUCTURE_SCRIPT}\"")

    if not has_changes():
        print("No changes to commit.")
        return

    tracked_paths = get_tracked_paths()
    print("Staging from file_tree.txt...")
    for path in tracked_paths:
        run(f"git add {path}")

    for path in IGNORED_PATHS:
        run(f"git reset {path}")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"auto: sync changes at {timestamp}"

    print("Committing...")
    run(f'git commit -m "{commit_msg}"')

    print("Pushing...")
    result = run("git push")

    print(result.stdout)
    print("Done.")

if __name__ == "__main__":
    main()
