
from pathlib import Path
import re

PROJECT_ROOT = Path(r"D:\AI_LAB\AI_Work")
REPORT_PATH = Path(
    r"D:\AI_LAB\Tools\Quick_Tools\path_audit_report.txt"
)

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
}

# Include source, configuration, scripts, and documentation.
SCANNED_EXTENSIONS = {
    ".py", ".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx",
    ".json", ".html", ".htm", ".css", ".scss",
    ".txt", ".md", ".yaml", ".yml", ".toml", ".xml",
    ".ini", ".cfg", ".conf", ".env", ".bat", ".cmd",
    ".ps1", ".sh", ".sql", ".gitignore",
}

# Detect absolute Windows paths, UNC paths, and file URLs.
ABSOLUTE_PATH = re.compile(
    r"""(?ix)
    (?:
        \b[A-Z]:[\\/][^\s"'<>|]*
        |
        \\\\[^\\\s]+\\[^\\\s"'<>|]*
        |
        file://[^\s"'<>]+
    )
    """
)

# Find path-related APIs and path construction.
PATH_API = re.compile(
    r"""(?ix)
    \b(?:
        pathlib|Path|PurePath|os\.path|pathlib\.Path|
        __dirname|__filename|process\.cwd|Path\.cwd|
        resolve|join|relative_to|relpath|abspath|
        realpath|chdir|cwd|open|read_text|read_bytes|
        write_text|write_bytes|readFile|readFileSync|
        writeFile|writeFileSync|appendFile|mkdir|
        makedirs|unlink|remove|rename|replace|
        copyfile|copytree|rmtree|execFile|subprocess
    )\b
    """
)

# Detect relative path literals and common project directories.
RELATIVE_PATH = re.compile(
    r"""(?ix)
    ["'](?:
        \.{1,2}[\\/][^"']+
        |
        (?:Database|Tools|Test|Sandbox|Structure|Utility|
           Bone_Code|Edit_Files|Logs|Config)[\\/][^"']+
    )["']
    """
)

PORT_REFERENCE = re.compile(
    r"""(?ix)
    \b(?:localhost|127\.0\.0\.1):\d{2,5}\b
    |
    \b(?:port|PORT|debugging-port)\s*["']?\s*[:=]\s*["']?\d{2,5}
    |
    \b(?:listen|app\.listen)\s*\(\s*\d{2,5}
    """
)

FILE_WRITE = re.compile(
    r"""(?ix)
    \b(?:
        write_text|write_bytes|writeFile|writeFileSync|
        appendFile|appendFileSync|mkdir|makedirs|
        unlink|remove|rename|replace|rmtree|copyfile|
        copyFile|copytree|move
    )\s*\(
    |
    \bopen\s*\(
    """
)

def excluded(path):
    return any(part.lower() in EXCLUDED_DIRS for part in path.parts)


def scan_file(file_path):
    try:
        content = file_path.read_text(
            encoding="utf-8-sig",
            errors="replace"
        )
    except OSError as exc:
        return [f"  [READ ERROR] {exc}"]

    findings = []

    for line_number, line in enumerate(content.splitlines(), start=1):
        categories = []

        if ABSOLUTE_PATH.search(line):
            categories.append("ABSOLUTE PATH")

        if RELATIVE_PATH.search(line):
            categories.append("RELATIVE PATH")

        if PATH_API.search(line):
            categories.append("PATH API")

        if PORT_REFERENCE.search(line):
            categories.append("PORT")

        if FILE_WRITE.search(line):
            categories.append("FILE WRITE/DELETE API")

        if categories:
            findings.append(
                f"  Line {line_number} [{', '.join(categories)}]\n"
                f"    {line.strip()}"
            )

    return findings


def main():
    if not PROJECT_ROOT.is_dir():
        print(f"ERROR: Project directory not found: {PROJECT_ROOT}")
        return

    report = [
        "AI_WORK — COMPREHENSIVE PATH AUDIT",
        f"Project root: {PROJECT_ROOT}",
        "Mode: READ ONLY — no project files are modified",
        "",
    ]

    files_scanned = 0
    files_with_findings = 0
    total_findings = 0

    for file_path in sorted(PROJECT_ROOT.rglob("*")):
        if not file_path.is_file() or excluded(file_path):
            continue

        if (
            file_path.suffix.lower() not in SCANNED_EXTENSIONS
            and file_path.name.lower() not in {".gitignore"}
        ):
            continue

        files_scanned += 1
        findings = scan_file(file_path)

        if findings:
            files_with_findings += 1
            total_findings += len(findings)

            relative = file_path.relative_to(PROJECT_ROOT)
            report.append(f"\nFILE: {relative}")
            report.extend(findings)

    report.extend([
        "",
        "========== SUMMARY ==========",
        f"Files scanned: {files_scanned}",
        f"Files containing findings: {files_with_findings}",
        f"Total matching lines: {total_findings}",
        "",
        "NOTE:",
        "This report identifies candidate references, not confirmed defects.",
        "Review each finding before changing any path.",
    ])

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(report), encoding="utf-8")

    print("\n".join(report[:5]))
    print(f"\nFiles scanned: {files_scanned}")
    print(f"Files containing findings: {files_with_findings}")
    print(f"Total matching lines: {total_findings}")
    print(f"Full report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
