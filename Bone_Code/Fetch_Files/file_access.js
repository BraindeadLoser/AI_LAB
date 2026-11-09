import {
    initializeRetrievalIndex,
    buildFileChunks,
    registerFile,
    retrieveSymbolContext
} from "./retrieval_index.js";

import {
    getAccessibleFiles
} from "./file_synchronization.js";

// Cache of currently accessible project files.
let ALLOWED_FILES = new Set();

/**
 * Refresh the accessible file inventory.
 * Generates a fresh file_tree.txt through file_synchronization.js.
 */
async function refreshAllowedFiles() {
    const files = await getAccessibleFiles();

    ALLOWED_FILES = new Set(
        files.map(filename =>
            filename.replace(/\\/g, "/")
        )
    );

    return [...ALLOWED_FILES];
}

/**
 * Return the current list of accessible files.
 */
export async function listAllowedFiles() {
    return await refreshAllowedFiles();
}

/**
 * Validate whether a file belongs to the accessible inventory.
 */
export async function isAllowedFile(filename) {
    if (typeof filename !== "string" || !filename.trim()) {
        return false;
    }

    const normalized = filename.replace(/\\/g, "/");

    if (
        normalized.startsWith("/") ||
        normalized.split("/").includes("..")
    ) {
        return false;
    }

    await refreshAllowedFiles();

    return ALLOWED_FILES.has(normalized);
}

/**
 * Raw IPC reader.
 * No indexing or recursion.
 */
async function rawReadSandboxFile(filename) {
    if (!(await isAllowedFile(filename))) {
        throw new Error("Access denied");
    }

    return await window.ipc.readSandboxFile(filename);
}

/**
 * Retrieve complete file content and register it
 * with the retrieval index.
 */
export async function readSandboxFile(filename) {
    try {
        if (!(await isAllowedFile(filename))) {
            throw new Error("Access denied");
        }

        const content = await rawReadSandboxFile(filename);

        if (
            !content ||
            content.startsWith("ERROR:") ||
            content.trim().length === 0
        ) {
            return {
                filename,
                content: "ERROR: Sandbox not available"
            };
        }

        const index = initializeRetrievalIndex();

        await buildFileChunks(
            index,
            filename,
            content,
            20
        );

        await registerFile(
            index,
            filename,
            content
        );

        return {
            filename,
            content
        };

    } catch (err) {
        console.error("File retrieval failed:", err);

        return {
            filename,
            content: `ERROR: Retrieval failed (${err.message || err})`
        };
    }
}

/**
 * Retrieve a specific line range from a file.
 */
export async function readSandboxFileLines(
    filename,
    startLine,
    endLine
) {
    if (!(await isAllowedFile(filename))) {
        throw new Error("Access denied");
    }

    if (
        typeof startLine !== "number" ||
        typeof endLine !== "number" ||
        !Number.isInteger(startLine) ||
        !Number.isInteger(endLine)
    ) {
        throw new Error("Invalid line range");
    }

    if (startLine < 1 || endLine < startLine) {
        throw new Error("Invalid line boundaries");
    }

    const content = await rawReadSandboxFile(filename);

    if (
        !content ||
        content.startsWith("ERROR:")
    ) {
        throw new Error("Sandbox retrieval failed");
    }

    const lines = content.split(/\r?\n/);

    const selectedLines = lines
        .slice(startLine - 1, endLine)
        .map((line, index) => {
            const actualLine = startLine + index;
            return `${actualLine}: ${line}`;
        });

    return {
        file: filename,
        startLine,
        endLine,
        content: selectedLines.join("\n")
    };
}

/**
 * Retrieve context surrounding a particular symbol.
 */
export async function readSandboxSymbol(
    filename,
    symbolName
) {
    if (!(await isAllowedFile(filename))) {
        throw new Error("Access denied");
    }

    const content = await rawReadSandboxFile(filename);

    if (
        !content ||
        content.startsWith("ERROR:")
    ) {
        throw new Error("Sandbox retrieval failed");
    }

    const index = initializeRetrievalIndex();

    await buildFileChunks(
        index,
        filename,
        content,
        20
    );

    await registerFile(
        index,
        filename,
        content
    );

    const result = retrieveSymbolContext(
        index,
        filename,
        content,
        symbolName
    );

    if (!result) {
        return {
            success: false,
            error: "Symbol not found"
        };
    }

    return {
        success: true,
        ...result
    };
}
