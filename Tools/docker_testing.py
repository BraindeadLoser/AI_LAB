import subprocess
import os
import sys
DOCKER_CONTEXT = r"D:\AI_LAB\Test\Docker-Testing"
IMAGE_NAME = "ai_sandbox"
CONTAINER_NAME = "ai_sandbox_container"
def build_container():
    subprocess.run([
        "docker", "build",
        "-t", IMAGE_NAME,
        "-f", os.path.join(DOCKER_CONTEXT, "Dockerfile"),
        DOCKER_CONTEXT
    ], check=True)
def remove_container():
    subprocess.run(
        ["docker", "rm", "-f", CONTAINER_NAME],
        stderr=subprocess.DEVNULL
    )
def remove_image():
    subprocess.run(
        ["docker", "rmi", "-f", IMAGE_NAME],
        stderr=subprocess.DEVNULL
    )
def run_container():
    subprocess.run([
        "docker", "run", "-d",
        "--name", CONTAINER_NAME,
        "-v", f"{DOCKER_CONTEXT}:/app",
        IMAGE_NAME,
        "tail", "-f", "/dev/null"
    ], check=True)

    init_git()
def init_git():
    subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "git", "init", "/app"
    ], check=True)
def list_files():
    subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "ls", "/app"
    ], check=True)
def read_file(filename):
    result = subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "cat", f"/app/{filename}"
    ], capture_output=True, text=True, check=True)
    print(result.stdout)
def apply_patch(patch_file):
    subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "git", "-C", "/app", "apply", patch_file
    ], check=True)
def git_status():
    result = subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "git", "-C", "/app", "status"
    ], capture_output=True, text=True, check=True)
    print(result.stdout)
if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "build":
        remove_container()
        remove_image()
        build_container()
    elif cmd == "run":
        run_container()
    elif cmd == "list":
        list_files()
    elif cmd == "patch":
        apply_patch(sys.argv[2])
    elif cmd == "read":
        filename = sys.argv[2]
        allowed_files = [
            "sample.py",
            "sample.java",
            "sample.go",
            "sample.rb"
        ]
        if filename not in allowed_files:
            print("ACCESS_DENIED")
            sys.exit(1)
        container_path = f"/app/{filename}"
        result = subprocess.run(
            [
                "docker",
                "exec",
                "ai_sandbox_container",
                "cat",
                container_path
            ],
            capture_output=True,
            text=True
        )
        print(result.stdout)
    elif cmd == "status":
        git_status()
    else:
        print("Unknown command")
        