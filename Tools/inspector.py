import os
import subprocess
print("=" * 60)
print("ARCHITECTURE INSPECTOR")
print("=" * 60)
def run_command(command):
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )
        return result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return "", str(e)
# ---------------------------------------------------
# STEP 1
# DOCKER ENVIRONMENT INSPECTION
# ---------------------------------------------------
print("\n[1] CHECKING DOCKER DAEMON")
stdout, stderr = run_command(["docker", "info"])
if stderr:
    print("\n[DOCKER ERROR]")
    print(stderr)
else:
    print("\nDocker daemon is reachable.")
print("\n" + "-" * 60)
print("[2] RUNNING CONTAINERS")
print("-" * 60)
stdout, stderr = run_command([
    "docker",
    "ps",
    "--format",
    "table {{.ID}}\t{{.Names}}\t{{.Status}}"
])
if stdout:
    print(stdout)
else:
    print("No running containers found.")
if stderr:
    print("\n[ERROR]")
    print(stderr)
print("\n" + "-" * 60)
print("[3] ALL CONTAINERS (INCLUDING STOPPED)")
print("-" * 60)
stdout, stderr = run_command([
    "docker",
    "ps",
    "-a",
    "--format",
    "table {{.ID}}\t{{.Names}}\t{{.Status}}"
])
if stdout:
    print(stdout)
else:
    print("No containers found.")
if stderr:
    print("\n[ERROR]")
    print(stderr)
    print("\n" + "-" * 60)
print("[4] HOST FILE ACCESS TEST")
print("-" * 60)
test_path = r"D:\AI_LAB\Sandbox\sample.py"
try:
    with open(test_path, "r", encoding="utf-8") as f:
        content = f.read()
    print("Host filesystem READ SUCCESSFUL\n")
    print("FIRST 300 CHARACTERS:\n")
    print(content[:300])
except Exception as e:
    print("Host filesystem READ FAILED")
    print(str(e))
    print("\n" + "-" * 60)
print("[5] SEARCHING FOR sample.py")
print("-" * 60)
search_root = r"D:\AI_LAB"
matches = []
for root, dirs, files in os.walk(search_root):
    if "sample.py" in files:
        matches.append(os.path.join(root, "sample.py"))
if matches:
    print("FOUND FILES:\n")
    for m in matches:
        print(m)
else:
    print("No sample.py found.")