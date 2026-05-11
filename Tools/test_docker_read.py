import subprocess

filename = "sample.py"
container_path = f"/app/{filename}"

result = subprocess.run(
    ["docker", "exec", "ai_sandbox_container", "cat", container_path],
    capture_output=True,
    text=True
)

print("=== CUSTOM TEST SCRIPT ===")
print("RAW STDOUT LENGTH:", len(result.stdout))
print("RAW STDOUT BYTES:", result.stdout.encode("utf-8"))
print("RAW STDOUT CONTENT:\n", result.stdout)
print("==========================")
