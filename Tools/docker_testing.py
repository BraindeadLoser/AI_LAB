import subprocess
import os
import sys

DOCKER_CONTEXT = r"D:\AI_LAB\Test\Docker-Testing"
IMAGE_NAME = "ai_sandbox"
CONTAINER_NAME = "ai_sandbox_container"

def build_container():
    subprocess.run(["docker", "build", "-t", IMAGE_NAME, "."], check=True)

def run_container():
    subprocess.run([
        "docker", "run", "--rm", "-d",
        "--name", CONTAINER_NAME,
        "-v", f"{DOCKER_CONTEXT}:/app",
        IMAGE_NAME,
        "tail", "-f", "/dev/null"
    ], check=True)

def list_files():
    subprocess.run(["docker", "exec", CONTAINER_NAME, "ls", "/app"], check=True)

def read_file(filename):
    subprocess.run(["docker", "exec", CONTAINER_NAME, "cat", f"/app/{filename}"], check=True)

def apply_patch(patch_file):
    subprocess.run(["docker", "exec", CONTAINER_NAME, "git", "apply", f"/app/{patch_file}"], check=True)

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "build":
        build_container()
    elif cmd == "run":
        run_container()
    elif cmd == "list":
        list_files()
    elif cmd == "read":
        read_file(sys.argv[2])
    elif cmd == "patch":
        apply_patch(sys.argv[2])
