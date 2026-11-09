
// Must match structure.py exclusions.
const EXCLUDED_ITEMS = new Set([
    "venv",
    "node_modules",
    ".git",
    "__pycache__",
    "package-lock.json",
    ".gitignore",
    ".editorconfig"
]);

/**
 * Parse the tree and extract project-relative file paths.
 */
function parseFileTree(treeContent) {
    const accessibleFiles = [];
    const directoryStack = [];

    const lines = treeContent.split(/\r?\n/);

    for (const line of lines) {
        const match = line.match(
            /^((?:│   |    )*)(?:├── |└── )(.+)$/
        );

        if (!match) {
            continue;
        }

        const indentation = match[1].length;
        const item = match[2].trim();

        const depth = indentation / 4;

        if (!Number.isInteger(depth)) {
            continue;
        }

        const isDirectory = item.endsWith("/");
        const name = isDirectory
            ? item.slice(0, -1)
            : item;

        if (!name || EXCLUDED_ITEMS.has(name.toLowerCase())) {
            continue;
        }

        directoryStack.length = depth;

        const relativePath = [
            ...directoryStack,
            name
        ].join("/");

        if (isDirectory) {
            directoryStack[depth] = name;
        } else {
            accessibleFiles.push(relativePath);
        }
    }

    return accessibleFiles;
}

/**
 * Generate the latest tree and return permitted project files.
 */
export async function getAccessibleFiles() {
    try {
        const treeContent = await window.ipc.getProjectFileTree();

        return parseFileTree(treeContent);

    } catch (error) {
        console.log(
            "File synchronization failed:",
            error.message || error
        );

        throw error;
    }
}
