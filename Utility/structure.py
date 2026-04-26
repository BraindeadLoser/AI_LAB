# structure.py
# Purpose: Scan AI_LAB folder, build tree diagram, exclude venv, save to Structure folder

import os

def build_file_tree(root_dir, prefix=""):
    tree_str = ""
    try:
        items = sorted(os.listdir(root_dir))
    except PermissionError:
        return prefix + "[Permission Denied]\n"

    # Exclude venv and node_modules folders
    items = [i for i in items if i.lower() not in ["venv", "node_modules", ".git", "__pycache__"]]

    for index, item in enumerate(items):
        path = os.path.join(root_dir, item)
        connector = "└── " if index == len(items) - 1 else "├── "
        if os.path.isdir(path):
            tree_str += f"{prefix}{connector}{item}/\n"
            extension = "    " if index == len(items) - 1 else "│   "
            tree_str += build_file_tree(path, prefix + extension)
        else:
            tree_str += f"{prefix}{connector}{item}\n"
    return tree_str

def save_tree_to_file(scan_path="D:/AI_LAB", output_path="D:/AI_LAB/Structure/file_tree.txt"):
    tree = build_file_tree(scan_path)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)  # ensure Structure folder exists
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(tree)
    print(f"File tree saved to: {output_path}")

if __name__ == "__main__":
    save_tree_to_file()
