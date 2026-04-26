import subprocess
from datetime import datetime

IGNORED_PATHS = ["venv", "node_modules"]

def run(cmd):
    return subprocess.run(cmd, shell=True, text=True, capture_output=True)

def has_changes():
    return run("git status --porcelain").stdout.strip() != ""

def main():
    if not has_changes():
        print("No changes to commit.")
        return

    print("Staging all changes...")
    run("git add .")

    # Safety layer: explicitly remove risky folders from staging
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