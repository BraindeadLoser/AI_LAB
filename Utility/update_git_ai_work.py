
import subprocess
import sys
from datetime import datetime
from pathlib import Path
import os

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

BRANCH = "ai-work"
REMOTE = "origin"

IGNORED_PATHS = [
    "venv",
    "node_modules",
    ".git",
    "__pycache__",
    "package-lock.json"
]

STRUCTURE_SCRIPT = PROJECT_ROOT / "Utility" / "structure.py"
FILE_TREE_PATH = PROJECT_ROOT / "Structure" / "file_tree.txt"


# --------------------------------------------------
# COMMAND EXECUTION
# --------------------------------------------------

def run(cmd, check=True):
    result = subprocess.run(
        cmd,
        cwd=PROJECT_ROOT,
        text=True,
        capture_output=True
    )

    if result.stdout.strip():
        print(result.stdout.strip())

    if result.stderr.strip():
        print(result.stderr.strip())

    if check and result.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(cmd)}"
        )

    return result


def run_git(*args, check=True):
    return run(["git", *args], check=check)


# --------------------------------------------------
# PROJECT AND BRANCH VERIFICATION
# --------------------------------------------------

def verify_project_root():
    result = run_git("rev-parse", "--show-toplevel")

    git_root = os.path.normcase(
        os.path.realpath(result.stdout.strip())
    )

    expected_root = os.path.normcase(
        os.path.realpath(PROJECT_ROOT)
    )

    if git_root != expected_root:
        raise RuntimeError(
            "Git repository root does not match AI_LAB root."
        )

    print(f"Project root verified: {PROJECT_ROOT}")


def verify_branch():
    result = run_git("branch", "--show-current")

    current_branch = result.stdout.strip()

    if current_branch != BRANCH:
        raise RuntimeError(
            f"Wrong branch detected: {current_branch}\n"
            f"This script operates exclusively on '{BRANCH}'.\n"
            "Switch branches manually before running again."
        )

    print(f"Active branch verified: {BRANCH}")


# --------------------------------------------------
# STAGING VERIFICATION
# --------------------------------------------------

def check_existing_staged_changes():
    result = run_git("diff", "--cached", "--quiet", check=False)

    if result.returncode == 1:
        raise RuntimeError(
            "Already-staged changes detected.\n"
            "Review or commit them before running this script."
        )

    if result.returncode != 0:
        raise RuntimeError("Unable to inspect Git staging area.")


def has_changes():
    result = run_git("status", "--porcelain")

    return result.stdout.strip() != ""


# --------------------------------------------------
# REMOTE SYNCHRONIZATION
# --------------------------------------------------

def synchronize_branch():

    print("\nChecking remote ai-work branch...")

    result = run_git(
        "ls-remote",
        "--heads",
        REMOTE,
        f"refs/heads/{BRANCH}"
    )

    if not result.stdout.strip():
        print(
            "Remote ai-work branch does not exist yet."
        )
        print("Skipping pull. First push will create it.")
        return

    print("\nFetching ai-work from GitHub...")

    run_git("fetch", REMOTE, BRANCH)

    print("\nPulling ai-work from GitHub...")

    # Fast-forward only: no automatic merge commits.
    run_git(
        "pull",
        "--ff-only",
        REMOTE,
        BRANCH
    )


# --------------------------------------------------
# PROJECT TREE GENERATION
# --------------------------------------------------

def refresh_file_tree():

    print("\nRefreshing project structure...")

    if not STRUCTURE_SCRIPT.exists():
        raise RuntimeError(
            f"structure.py not found: {STRUCTURE_SCRIPT}"
        )

    run([
        sys.executable,
        str(STRUCTURE_SCRIPT)
    ])

    if not FILE_TREE_PATH.exists():
        raise RuntimeError(
            "file_tree.txt was not generated."
        )


# --------------------------------------------------
# TREE-BASED PATH SELECTION
# --------------------------------------------------

def get_tracked_paths():

    if not FILE_TREE_PATH.exists():
        raise RuntimeError("file_tree.txt not found.")

    with FILE_TREE_PATH.open(
        "r",
        encoding="utf-8"
    ) as f:
        lines = [
            line.strip()
            for line in f
            if line.strip()
        ]

    paths = []

    for line in lines:

        # Select only top-level entries.
        # Git stages their complete directory hierarchies.

        if line.startswith("├──") or line.startswith("└──"):

            path = line[4:].strip()

            if path and path.rstrip("/") not in IGNORED_PATHS:
                paths.append(path)

    if not paths:
        raise RuntimeError(
            "No valid paths found in file_tree.txt."
        )

    return paths


# --------------------------------------------------
# GIT STAGING
# --------------------------------------------------

def stage_changes():

    tracked_paths = get_tracked_paths()

    print("\nStaging project paths...")

    for path in tracked_paths:

        print(f"Staging: {path}")

        run_git(
            "add",
            "-A",
            "--",
            path
        )

    # Explicitly unstage excluded directories.
    for path in ["venv", "node_modules"]:

        run_git(
            "reset",
            "-q",
            "--",
            path,
            check=False
        )

    result = run_git(
        "diff",
        "--cached",
        "--quiet",
        check=False
    )

    if result.returncode == 0:
        print(
            "\nNo eligible changes were staged."
        )
        return False

    if result.returncode != 1:
        raise RuntimeError(
            "Unable to verify staged changes."
        )

    return True


# --------------------------------------------------
# COMMIT
# --------------------------------------------------

def commit_changes():

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    commit_msg = f"auto: ai-work sync at {timestamp}"

    print("\nCommitting changes...")

    run_git(
        "commit",
        "-m",
        commit_msg
    )


# --------------------------------------------------
# PUSH
# --------------------------------------------------

def push_changes():

    print("\nPushing exclusively to origin ai-work...")

    run_git(
        "push",
        "-u",
        REMOTE,
        BRANCH
    )


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    try:

        print("=" * 50)
        print("AI_LAB EXPERIMENTAL GIT SYNCHRONIZATION")
        print("=" * 50)

        verify_project_root()

        verify_branch()

        check_existing_staged_changes()

        synchronize_branch()

        refresh_file_tree()

        if not has_changes():

            print("\nNo changes to commit.")

            return

        if not stage_changes():

            print("\nNo eligible changes to publish.")

            return

        commit_changes()

        push_changes()

        print("\n" + "=" * 50)
        print("AI_WORK SYNCHRONIZATION COMPLETED")
        print("=" * 50)

    except Exception as error:

        print("\n" + "!" * 50)
        print("SYNCHRONIZATION STOPPED")
        print(f"Reason: {error}")
        print("!" * 50)

        sys.exit(1)


if __name__ == "__main__":
    main()
