
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

# =======================================================
# CONFIGURATION
# =======================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

SOURCE_BRANCH = "ai-work"
TARGET_BRANCH = "main"
REMOTE = "origin"

ALLOWED_UNTRACKED = {
    "venv",
    "node_modules"
}


# =======================================================
# GIT COMMAND EXECUTION
# =======================================================

def run_git(*args, check=True):

    result = subprocess.run(
        ["git", *args],
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
            f"Git command failed: git {' '.join(args)}"
        )

    return result


# =======================================================
# PROJECT VERIFICATION
# =======================================================

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
            "Project root verification failed."
        )

    print(f"Project root verified: {PROJECT_ROOT}")


# =======================================================
# WORKING TREE VERIFICATION
# =======================================================

def verify_clean_working_tree():

    result = run_git(
        "status",
        "--porcelain",
        "--untracked-files=normal"
    )

    changes = result.stdout.splitlines()

    unexpected_changes = []

    for line in changes:

        status = line[:2]
        path = line[3:].strip().replace("\\", "/")

        if status == "??":

            if path.rstrip("/") in ALLOWED_UNTRACKED:
                continue

        unexpected_changes.append(line)

    if unexpected_changes:

        raise RuntimeError(
            "Unexpected uncommitted changes detected:\n"
            + "\n".join(unexpected_changes)
            + "\nPreserve or resolve these changes before merging."
        )

    print("Working tree verified.")


# =======================================================
# FETCH REMOTE BRANCHES
# =======================================================

def fetch_branches():

    print("\nFetching latest GitHub branches...")

    run_git("fetch", REMOTE, "--prune")

    for branch in [SOURCE_BRANCH, TARGET_BRANCH]:

        run_git(
            "rev-parse",
            "--verify",
            f"refs/remotes/{REMOTE}/{branch}"
        )

    print("Remote branches verified.")


# =======================================================
# SWITCH TO MAIN
# =======================================================

def switch_to_main():

    print("\nSwitching to main branch...")

    run_git("switch", TARGET_BRANCH)

    current = run_git(
        "branch",
        "--show-current"
    ).stdout.strip()

    if current != TARGET_BRANCH:
        raise RuntimeError(
            "Failed to switch to main branch."
        )

    print("Active branch verified: main")


# =======================================================
# SYNCHRONIZE MAIN
# =======================================================

def synchronize_main():

    print("\nSynchronizing main with GitHub...")

    run_git(
        "pull",
        "--ff-only",
        REMOTE,
        TARGET_BRANCH
    )

    print("Main branch synchronized.")


# =======================================================
# CHECK FOR NEW CHANGES
# =======================================================

def verify_new_changes():

    result = run_git(
        "merge-base",
        "--is-ancestor",
        f"{REMOTE}/{SOURCE_BRANCH}",
        f"{REMOTE}/{TARGET_BRANCH}",
        check=False
    )

    if result.returncode == 0:

        raise RuntimeError(
            "No new ai-work changes are available. "
            "The source branch is already merged into main."
        )

    if result.returncode != 1:

        raise RuntimeError(
            "Unable to determine branch relationship."
        )

    print("New ai-work changes identified.")


# =======================================================
# MERGE AI-WORK INTO MAIN
# =======================================================

def merge_branches():

    print("\nMerging ai-work into main...")

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    merge_message = (
        f"merge: ai-work into main ({timestamp})"
    )

    run_git(
        "merge",
        "--no-ff",
        "--no-edit",
        "-m",
        merge_message,
        f"{REMOTE}/{SOURCE_BRANCH}"
    )

    print("\nAI-work changes successfully merged into main.")


# =======================================================
# PUBLISH MAIN
# =======================================================

def publish_main():

    print("\nPublishing updated main branch to GitHub...")

    run_git(
        "push",
        REMOTE,
        TARGET_BRANCH
    )

    print("Updated main branch published to GitHub.")


# =======================================================
# MAIN EXECUTION
# =======================================================

def main():

    print("=======================================================")
    print("AI_LAB BRANCH MERGE")
    print("=======================================================\n")

    try:

        print(PROJECT_ROOT)

        verify_project_root()

        verify_clean_working_tree()

        fetch_branches()

        switch_to_main()

        verify_clean_working_tree()

        synchronize_main()

        verify_new_changes()

        merge_branches()

        publish_main()

        print("\n=======================================================")
        print("BRANCH MERGE COMPLETED SUCCESSFULLY")
        print("=======================================================")

    except Exception as error:

        print("\n=======================================================")
        print("MERGE STOPPED")
        print("=======================================================")

        print(f"Reason: {error}")

        print(
            "\nIf a merge conflict occurred, resolve it "
            "or use 'git merge --abort' to cancel the merge."
        )

        sys.exit(1)


if __name__ == "__main__":
    main()
