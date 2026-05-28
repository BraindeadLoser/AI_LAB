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
        return {
            "success": True,
            "containerId": container.id,
            "status": "running",
            "logs": [],
            "errors": []
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
    Stop and cleanup validation container.
    """
    if container_id not in ACTIVE_CONTAINERS:
        return {
            "success": False,
            "status": "not_found"
        }
    data = ACTIVE_CONTAINERS[
        container_id
    ]
    container = data["container"]
    temp_dir = data["temp_dir"]
    try:
        container.stop()
        container.remove(force=True)
    finally:
        shutil.rmtree(
            temp_dir,
            ignore_errors=True
        )
        del ACTIVE_CONTAINERS[
            container_id
        ]
    return {
        "success": True,
        "status": "stopped"
    }