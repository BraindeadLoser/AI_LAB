import { initializeRetrievalIndex, buildFileChunks } from "./retrieval_index.js";
// Bone_Code/js/file_access.js
const ALLOWED_FILES = [
  "sample.py",
  "sample.java",
  "sample.go",
  "sample.rb"
];

// Return safe enumerated list of accessible sandbox files
export function listAllowedFiles() {
  return [...ALLOWED_FILES];
}
// Raw IPC reader (no indexing, no recursion)
async function rawReadSandboxFile(filename) {
  if (!isAllowedFile(filename)) {
    throw new Error("Access denied");
  }
  return await window.ipc.readSandboxFile(filename);
}
// Validate whitelist membership
export function isAllowedFile(filename) {
  return ALLOWED_FILES.includes(filename);
}
// Secure retrieval through IPC → main.js → docker_testing.py
export async function readSandboxFile(filename) {
  if (!isAllowedFile(filename)) {
    throw new Error("Access denied");
  }
  const index = initializeRetrievalIndex();
  await buildFileChunks(index, filename, 20, rawReadSandboxFile);
  try {
const content = await rawReadSandboxFile(filename);
    const lines = content.split(/\r?\n/);
    // Guard: if Docker is unreachable or returns empty
    if (!content || content.trim().length === 0) {
      return {
        filename,
        content: "ERROR: Sandbox not available"
      };
    }
    return {
      filename,
      content
    };
  } catch (err) {
    // Catch IPC/Docker errors cleanly
    return {
      filename,
      content: `ERROR: Retrieval failed (${err.message || err})`
    };
  }
}
//
export async function readSandboxFileLines(filename, startLine, endLine) {

    if (!isAllowedFile(filename)) {
        throw new Error("Access denied");
    }

    if (
        typeof startLine !== "number" ||
        typeof endLine !== "number"
    ) {
        throw new Error("Invalid line range");
    }

    if (startLine < 1 || endLine < startLine) {
        throw new Error("Invalid line boundaries");
    }
  // Retrieve full content first (could optimize later with line-based retrieval in Docker)
    const content = await rawReadSandboxFile(filename);

    if (
        !content ||
        content.startsWith("ERROR:")
    ) {
      console.log("RAW CONTENT:", content);
        throw new Error("Sandbox retrieval failed");
    }
// Guard: if requested range exceeds file length, adjust gracefully
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