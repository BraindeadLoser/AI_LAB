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

// Validate whitelist membership
export function isAllowedFile(filename) {
  return ALLOWED_FILES.includes(filename);
}

// Secure retrieval through IPC → main.js → docker_testing.py
export async function readSandboxFile(filename) {
  if (!isAllowedFile(filename)) {
    throw new Error("Access denied");
  }

  try {
    const content = await window.ipc.readSandboxFile(filename);
        console.log("AI INPUT PAYLOAD:", content);
    console.log("AI INPUT LENGTH:", content.length);

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
