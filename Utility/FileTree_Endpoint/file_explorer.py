import os
import re
import subprocess
import sqlite3
from flask import Flask, request, jsonify, send_from_directory, abort

app = Flask(__name__)

ASCII_TREE_CHARS = re.compile(r'[├└│─ ]+')

FILE_TREE_PATH = r"D:\AI_LAB\Structure\file_tree.txt"
PYTHON_SCRIPT_PATH = r"D:\AI_LAB\Utility\structure.py"
DB_PATH = r"D:\AI_LAB\Database\file_descriptions.db"
STATIC_DIR = r"D:\AI_LAB\Utility\FileTree_Endpoint"


class FileNode:
    def __init__(self, name, path, is_folder):
        self.name = name
        self.path = path
        self.isFolder = is_folder
        self.children = []

    def to_dict(self):
        d = {
            "name": self.name,
            "path": self.path,
            "isFolder": self.isFolder,
        }
        if self.children:
            d["children"] = [child.to_dict() for child in self.children]
        return d


def run_structure_updater():
    result = subprocess.run(["python", PYTHON_SCRIPT_PATH], capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Updater failed: {result.stderr}")


def parse_file_tree():
    with open(FILE_TREE_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    root = FileNode("root", "", True)
    stack = [root]

    for line in lines:
        if line.strip() == "":
            continue

        depth = line.count("│") + line.count("    ")
        clean_name = ASCII_TREE_CHARS.sub("", line).strip()
        is_folder = clean_name.endswith("/")

        if depth < len(stack):
            stack = stack[:depth + 1]

        parent = stack[-1]
        node_path = os.path.join(parent.path, clean_name).replace("\\", "/")

        node = FileNode(clean_name, node_path, is_folder)
        parent.children.append(node)

        if is_folder:
            stack.append(node)

    return root


def get_description(file_name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT description FROM file_descriptions WHERE file_name = ?", (file_name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row[0] if row[0] else "No description available"
    return "No description available"


def find_file_in_tree(node, target_name):
    """Recursively search tree for a file and return its full path"""
    if node.name == target_name and not node.isFolder:
        return node.path
    
    for child in node.children:
        result = find_file_in_tree(child, target_name)
        if result:
            return result
    
    return None


@app.route("/tree")
def tree():
    try:
        tree = parse_file_tree()
        return jsonify(tree.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/definition")
def definition():
    full_path = request.args.get("path")
    if not full_path:
        return jsonify({"error": "Missing path parameter"}), 400

    root_dir = r"D:\AI_LAB"
    
    # If full_path is just a filename, search the tree to find its complete path
    if "/" not in full_path.strip("/"):
        # It's just a filename, search the tree
        tree = parse_file_tree()
        full_path = find_file_in_tree(tree, full_path.strip("/\\"))
        if not full_path:
            return jsonify({"error": "File not found in tree"}), 404

    # Build absolute path by tracing navigation from root
    parts = full_path.strip("/\\").split("/")
    abs_path = os.path.normpath(os.path.join(root_dir, *parts)).replace("\\", "/")

    file_name = os.path.basename(full_path)
    try:
        description = get_description(file_name)
    except Exception as e:
        return jsonify({"error": "Database error"}), 500

    return jsonify({
        "file": file_name,
        "location": abs_path,
        "definition": description,
    })

@app.route("/", defaults={"filename": "index.html"})
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)


if __name__ == "__main__":
    try:
        run_structure_updater()
    except Exception as e:
        print(e)
    app.run(host="0.0.0.0", port=3000)
