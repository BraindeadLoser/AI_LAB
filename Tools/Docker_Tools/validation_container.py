import docker
import tempfile
import shutil
import os

client = docker.from_env()
ACTIVE_CONTAINERS = {}

def get_language_config(filename):
    ext = os.path.splitext(filename)[1].lower()

    configs = {
        ".py": {
            "image": "python:3.11",
            "command": lambda f: f"python /workspace/{f}"
        },

        ".js": {
            "image": "node:22",
            "command": lambda f: f"node /workspace/{f}"
        },

        ".ts": {
            "image": "node:22",
            "command": lambda f: f"node --experimental-strip-types /workspace/{f}"
        },

        ".java": {
            "image": "eclipse-temurin:21-jdk",
            "command": lambda f: (
                f"javac /workspace/{f} && "
                f"java -cp /workspace {os.path.splitext(f)[0]}"
            )
        },

        ".cpp": {
            "image": "gcc:14",
            "command": lambda f: (
                f"g++ /workspace/{f} -o /workspace/program && "
                f"/workspace/program"
            )
        },

        ".c": {
            "image": "gcc:14",
            "command": lambda f: (
                f"gcc /workspace/{f} -o /workspace/program && "
                f"/workspace/program"
            )
        },

        ".go": {
            "image": "golang:1.24",
            "command": lambda f: f"go run /workspace/{f}"
        },

        ".rs": {
            "image": "rust:1.89",
            "command": lambda f: (
                f"rustc /workspace/{f} -o /workspace/program && "
                f"/workspace/program"
            )
        },

        ".rb": {
            "image": "ruby:3.4",
            "command": lambda f: f"ruby /workspace/{f}"
        },

        ".php": {
            "image": "php:8.4-cli",
            "command": lambda f: f"php /workspace/{f}"
        }
    }

    return configs.get(ext)

def start_validation_container(
    file_path,
    patched_content
):
    """
    Start isolated validation container.
    Detect language from file extension,
    compile if necessary, then execute.
    """

    temp_dir = tempfile.mkdtemp()

    try:
        filename = os.path.basename(file_path)

        config = get_language_config(
            filename
        )

        if not config:
            shutil.rmtree(
                temp_dir,
                ignore_errors=True
            )

            return {
                "success": False,
                "status": "failed",
                "logs": [],
                "errors": [
                    f"Unsupported language: {filename}"
                ]
            }

        temp_file_path = os.path.join(
            temp_dir,
            filename
        )

        with open(
            temp_file_path,
            "w",
            encoding="utf-8"
        ) as f:
            f.write(patched_content)

        container = client.containers.run(
            image=config["image"],
            command=config["command"](filename),

            volumes={
                temp_dir: {
                    "bind": "/workspace",
                    "mode": "rw"
                }
            },

            detach=True,
            stderr=True,
            stdout=True,

            name=f"validation_container_{os.getpid()}",

            network_mode="none"
        )

        ACTIVE_CONTAINERS[
            container.id
        ] = {
            "container": container,
            "temp_dir": temp_dir
        }

        result = container.wait()

        logs = container.logs().decode(
            "utf-8",
            errors="replace"
        )

        exit_code = result.get(
            "StatusCode",
            1
        )

        return {
            "success":
                exit_code == 0,

            "containerId":
                container.id,

            "status":
                "completed"
                if exit_code == 0
                else "failed",

            "logs": [logs],

            "errors":
                []
                if exit_code == 0
                else [logs]
        }

    except Exception as err:

        shutil.rmtree(
            temp_dir,
            ignore_errors=True
        )

        return {
            "success": False,
            "status": "failed",
            "logs": [],
            "errors": [
                str(err)
            ]
        }

def stop_validation_container(
    container_id
):
    """
    Stop and remove validation container.
    """

    try:
        container = (
            client.containers.get(
                container_id
            )
        )

        container.stop()

        container.remove(
            force=True
        )

        return {
            "success": True,
            "status": "stopped"
        }

    except Exception as err:

        return {
            "success": False,
            "status": "failed",
            "error": str(err)
        }

if __name__ == "__main__":
    import sys
    import json

    command = sys.argv[1]

    if command == "start":
        payload = json.loads(sys.argv[2])

        result = start_validation_container(
            file_path=payload["file"],
            patched_content=payload["patchedContent"]
        )

        print(json.dumps(result))

    elif command == "stop":
        container_id = sys.argv[2]

        result = stop_validation_container(
            container_id
        )

        print(json.dumps(result))