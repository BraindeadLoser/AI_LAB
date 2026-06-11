import docker
import tempfile
import shutil
import os

client = docker.from_env()
ACTIVE_CONTAINERS = {}
def start_validation_container(
    file_path,
    patched_content,
    image="python:3.11"
):
    """
    Start isolated validation container.
    Inject patched code into temp workspace.
    """
    temp_dir = tempfile.mkdtemp()
    try:
        filename = os.path.basename(file_path)
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
            image=image,
            command=f"python /workspace/{filename}",
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
            "success": (
                exit_code == 0
            ),
            "containerId":
                container.id,
            "status":
                "completed"
                if exit_code == 0
                else "failed",
            "logs": [logs],
            "errors": []
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
            "errors": [str(err)]
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