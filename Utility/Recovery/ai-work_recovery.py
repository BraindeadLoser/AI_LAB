
import subprocess
import sys
import os
from pathlib import Path

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

BRANCH = "ai-work"
REMOTE = "origin"

CHECKPOINT_PREFIX = "auto: ai-work sync at "


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
# PROJECT VERIFICATION
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
            "Git repository root verification failed."
        )

    print(f"Project root verified: {PROJECT_ROOT}")


# --------------------------------------------------
# BRANCH VERIFICATION
# --------------------------------------------------

def verify_branch():

    result = run_git("branch", "--show-current")

    current_branch = result.stdout.strip()

    if current_branch != BRANCH:
        raise RuntimeError(
            f"Recovery denied.\n"
            f"Current branch: {current_branch}\n"
            f"Required branch: {BRANCH}"
        )

    print(f"Active branch verified: {BRANCH}")


# --------------------------------------------------
# WORKING TREE VERIFICATION
# --------------------------------------------------

def verify_clean_working_tree():

    result = run_git(
        "status",
        "--porcelain",
        "--untracked-files=all"
    )

    if result.stdout.strip():

        raise RuntimeError(
            "Uncommitted changes detected.\n"
            "Commit or safely preserve these changes "
            "before recovery."
        )

    print("Working tree is clean.")


# --------------------------------------------------
# REMOTE VERIFICATION
# --------------------------------------------------

def verify_remote_checkpoint():

    print("\nFetching latest ai-work checkpoint...")

    run_git(
        "fetch",
        REMOTE,
        f"refs/heads/{BRANCH}:refs/remotes/{REMOTE}/{BRANCH}"
    )

    local_commit = run_git(
        "rev-parse",
        "HEAD"
    ).stdout.strip()

    remote_commit = run_git(
        "rev-parse",
        f"{REMOTE}/{BRANCH}"
    ).stdout.strip()

    if local_commit != remote_commit:

        raise RuntimeError(
            "Local and remote ai-work checkpoints differ.\n"
            "Synchronize the branch before recovery."
        )

    print("Local and remote checkpoints match.")


# --------------------------------------------------
# CHECKPOINT VERIFICATION
# --------------------------------------------------

def verify_latest_checkpoint():

    commit_message = run_git(
        "log",
        "-1",
        "--format=%s"
    ).stdout.strip()

    if not commit_message.startswith(CHECKPOINT_PREFIX):

        raise RuntimeError(
            "The latest commit is not an AI-work "
            "checkpoint created by update_git_ai_work.py.\n"
            "Recovery cancelled."
        )

    # Require exactly one parent.
    # This prevents accidental merge-commit reverts.

    parents = run_git(
        "rev-list",
        "--parents",
        "-n",
        "1",
        "HEAD"
    ).stdout.strip().split()

    if len(parents) != 2:

        raise RuntimeError(
            "The latest checkpoint is not a normal "
            "single-parent commit.\n"
            "Recovery cancelled."
        )

    print(f"Checkpoint identified: {commit_message}")


# --------------------------------------------------
# RECOVERY
# --------------------------------------------------

def recover_previous_checkpoint():

    print("\nReverting latest AI-work checkpoint...")

    run_git(
        "revert",
        "--no-edit",
        "HEAD"
    )

    print("\nPrevious application state restored.")


# --------------------------------------------------
# PUBLISH RECOVERY
# --------------------------------------------------

def publish_recovery():

    print("\nPublishing recovered state...")

    run_git(
        "push",
        REMOTE,
        BRANCH
    )

    print("Recovery published to GitHub.")


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    try:

        print("=" * 55)
        print("AI_LAB APPLICATION RECOVERY")
        print("=" * 55)

        verify_project_root()

        verify_branch()

        verify_clean_working_tree()

        verify_remote_checkpoint()

        verify_latest_checkpoint()

        recover_previous_checkpoint()

        publish_recovery()

        print("\n" + "=" * 55)
        print("APPLICATION RECOVERY COMPLETED")
        print("=" * 55)

    except Exception as error:

        print("\n" + "!" * 55)
        print("RECOVERY STOPPED")
        print(f"Reason: {error}")
        print("!" * 55)

        sys.exit(1)


if __name__ == "__main__":
    main()
