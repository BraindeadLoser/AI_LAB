
import subprocess
import os
import sys
import re
import json
from pathlib import Path


# --------------------------------------------------
# PROJECT CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DOCKER_CONTEXT = PROJECT_ROOT / "Test" / "Docker-Testing"

FILE_TREE = PROJECT_ROOT / "Structure" / "file_tree.txt"

IMAGE_NAME = "ai_sandbox"
CONTAINER_NAME = "ai_sandbox_container"

WORKSPACE = "/workspace"
MANIFEST_PATH = "/var/lib/ai-lab-sync/manifest.json"

EXCLUDED_ITEMS = {
    "venv",
    "node_modules",
    ".git",
    "__pycache__",
    "package-lock.json",
    ".gitignore",
    ".editorconfig"
}


# --------------------------------------------------
# DOCKER COMMAND EXECUTION
# --------------------------------------------------

def docker_command(args, **kwargs):
    return subprocess.run(
        ["docker"] + args,
        check=True,
        **kwargs
    )


# --------------------------------------------------
# DOCKER LIFECYCLE
# --------------------------------------------------

def build_container():

    docker_command(
        ["build",
         "-t", IMAGE_NAME,
         "-f", str(DOCKER_CONTEXT / "Dockerfile"),
         str(DOCKER_CONTEXT)]
    )


def remove_container():

    subprocess.run(
        ["docker", "rm", "-f", CONTAINER_NAME],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )


def remove_image():

    subprocess.run(
        ["docker", "rmi", "-f", IMAGE_NAME],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )


def run_container():

    docker_command([
        "run", "-d",
        "--name", CONTAINER_NAME,
        IMAGE_NAME,
        "tail", "-f", "/dev/null"
    ])

    init_git()


def init_git():

    docker_command([
        "exec", CONTAINER_NAME,
        "git", "init", WORKSPACE
    ])


def ensure_container_running():

    result = subprocess.run(
        [
            "docker", "inspect",
            "-f", "{{.State.Running}}",
            CONTAINER_NAME
        ],
        capture_output=True,
        text=True
    )

    if result.returncode != 0 or result.stdout.strip() != "true":
        raise RuntimeError(
            "Docker container is not running. Run the container first."
        )

# --------------------------------------------------
# FILE TREE PARSING
# --------------------------------------------------

def parse_file_tree():

    if not FILE_TREE.exists():
        raise FileNotFoundError(
            f"File tree not found: {FILE_TREE}"
        )

    tree_content = FILE_TREE.read_text(encoding="utf-8")

    files = []
    directories = []
    directory_stack = []

    for line in tree_content.splitlines():

        match = re.match(
            r'^((?:(?:│   )|(?:    ))*)(?:├── |└── )(.+)$',
            line
        )

        if not match:
            continue

        indentation = len(match.group(1))
        depth = indentation // 4

        if indentation % 4 != 0:
            continue

        item = match.group(2).strip()

        directory_stack = directory_stack[:depth]

        is_directory = item.endswith("/")

        name = item[:-1] if is_directory else item

        if not name or name.lower() in EXCLUDED_ITEMS:
            continue

        relative_path = "/".join(
            directory_stack + [name]
        )

        if is_directory:

            directories.append(relative_path)

            directory_stack.append(name)

        else:

            files.append(relative_path)

    return files, directories

# --------------------------------------------------
# PATH SECURITY
# --------------------------------------------------

def validate_relative_path(filename):

    if not filename or not isinstance(filename, str):
        raise ValueError("Invalid filename")

    normalized = filename.replace("\\", "/")

    path = Path(normalized)

    if (
        path.is_absolute()
        or ".." in path.parts
        or "." in path.parts
        or not path.parts
    ):
        raise ValueError("Access denied")

    if any(
        part.lower() in EXCLUDED_ITEMS
        for part in path.parts
    ):
        raise ValueError("Access denied")

    return path.as_posix()


def get_allowed_files():

    files, _ = parse_file_tree()

    allowed = set()

    for filename in files:

        relative_path = validate_relative_path(filename)

        host_path = (PROJECT_ROOT / relative_path).resolve()

        try:
            host_path.relative_to(PROJECT_ROOT.resolve())
        except ValueError:
            continue

        if host_path.is_file():
            allowed.add(relative_path)

    return allowed

# --------------------------------------------------
# DOCKER WORKSPACE SYNCHRONIZATION
# --------------------------------------------------

def read_previous_manifest():

    result = subprocess.run(
        [
            "docker", "exec",
            CONTAINER_NAME,
            "cat", MANIFEST_PATH
        ],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return {}

    try:
        data = json.loads(result.stdout)

        if not isinstance(data, dict):
            return {}

        return data

    except (json.JSONDecodeError, TypeError):
        return {}

def remove_stale_files(previous_files, current_files):

    stale_files = previous_files - current_files

    for filename in stale_files:

        docker_command([
            "exec", CONTAINER_NAME,
            "rm", "-f", "--",
            f"{WORKSPACE}/{filename}"
        ])

    if stale_files:
        docker_command([
            "exec", CONTAINER_NAME,
            "find", WORKSPACE,
            "-mindepth", "2",
            "-type", "d",
            "-empty",
            "-delete"
        ])


def synchronize_files():

    import hashlib

    ensure_container_running()

    current_files = get_allowed_files()
    previous_files = read_previous_manifest()

    current_manifest = {}

    # Remove deleted or excluded files.
    previous_paths = set(previous_files.keys())
    stale_files = previous_paths - current_files

    for filename in stale_files:
        docker_command([
            "exec", CONTAINER_NAME,
            "rm", "-f", "--",
            f"{WORKSPACE}/{filename}"
        ])

    if stale_files:
        docker_command([
            "exec", CONTAINER_NAME,
            "find", WORKSPACE,
            "-mindepth", "2",
            "-type", "d",
            "-empty",
            "-delete"
        ])

    # Ensure workspace exists.
    docker_command([
        "exec", CONTAINER_NAME,
        "mkdir", "-p", WORKSPACE
    ])

    synchronized_count = 0

    for filename in sorted(current_files):

        source = PROJECT_ROOT / Path(filename)

        if not source.is_file():
            continue

        file_hash = hashlib.sha256(
            source.read_bytes()
        ).hexdigest()

        current_manifest[filename] = file_hash

        previous_hash = previous_files.get(filename)

        # Copy only new or host-modified files.
        if previous_hash != file_hash:

            destination = f"{WORKSPACE}/{filename}"
            parent_directory = os.path.dirname(destination)

            docker_command([
                "exec", CONTAINER_NAME,
                "mkdir", "-p", parent_directory
            ])

            docker_command([
                "cp",
                str(source),
                f"{CONTAINER_NAME}:{destination}"
            ])

            synchronized_count += 1

    # Save updated manifest.
    docker_command([
        "exec", CONTAINER_NAME,
        "mkdir", "-p",
        os.path.dirname(MANIFEST_PATH)
    ])

    manifest = json.dumps(current_manifest)

    docker_command(
        [
            "exec", "-i",
            CONTAINER_NAME,
            "sh", "-c",
            f"cat > {MANIFEST_PATH}"
        ],
        input=manifest,
        text=True
    )

    print(
        f"Synchronization complete. "
        f"{synchronized_count} files copied; "
        f"{len(stale_files)} files removed.",
        file=sys.stderr
    )

    return sorted(current_files)

# --------------------------------------------------
# FILE ACCESS
# --------------------------------------------------

def read_file(filename):

    allowed_files = get_allowed_files()

    normalized = validate_relative_path(filename)

    if normalized not in allowed_files:
        raise PermissionError("Access denied")

    synchronize_files()

    result = docker_command(
        [
            "exec", CONTAINER_NAME,
            "cat", f"{WORKSPACE}/{normalized}"
        ],
        capture_output=True,
        text=True
    )

    print(result.stdout, end="")


# --------------------------------------------------
# OTHER DOCKER OPERATIONS
# --------------------------------------------------

def list_files():

    ensure_container_running()

    docker_command([
        "exec", CONTAINER_NAME,
        "find", WORKSPACE,
        "-type", "f"
    ])


def apply_patch(patch_file):

    ensure_container_running()

    docker_command([
        "exec", CONTAINER_NAME,
        "git", "-C", WORKSPACE,
        "apply", patch_file
    ])


def git_status():

    ensure_container_running()

    result = docker_command(
        [
            "exec", CONTAINER_NAME,
            "git", "-C", WORKSPACE,
            "status"
        ],
        capture_output=True,
        text=True
    )

    print(result.stdout)


# --------------------------------------------------
# COMMAND HANDLER
# --------------------------------------------------

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            "Usage: docker_testing.py "
            "[build|run|list|read|status|patch]"
        )

        sys.exit(1)

    cmd = sys.argv[1]

    try:

        if cmd == "build":

            remove_container()
            remove_image()
            build_container()

        elif cmd == "run":

            run_container()

        elif cmd == "list":

            list_files()

        elif cmd == "read":

            if len(sys.argv) < 3:
                raise ValueError("Filename required")

            read_file(sys.argv[2])

        elif cmd == "patch":

            if len(sys.argv) < 3:
                raise ValueError("Patch filename required")

            apply_patch(sys.argv[2])

        elif cmd == "status":

            git_status()

        elif cmd == "sync":
            synchronized_files = synchronize_files()
            print(json.dumps(synchronized_files))
            

        else:

            raise ValueError(f"Unknown command: {cmd}")

    except Exception as error:

        print(
            f"ERROR: {error}",
            file=sys.stderr
        )

        sys.exit(1)
