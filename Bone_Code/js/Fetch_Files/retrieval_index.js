import {
    listAllowedFiles,
    readSandboxFile
} from "./file_access.js";
//This establishes the future index structure for file retrieval and symbol lookup. It is designed to be flexible and extensible, allowing us to easily add new features like chunking or metadata as needed.
export function createRetrievalIndex() {

    return {
        files: {},
        symbols: {},
        chunks: {}
    };
}
// Purpose- establish deterministic file registration, prepare future chunk/symbol association, keep indexing centralized instead of scattered across modules.
export function registerFile(index, filename, metadata = {}) {

    index.files[filename] = {
        filename,
        ...metadata
    };

    return index.files[filename];
}
//Purpose: create deterministic retrieval visibility, avoid direct internal structure access later, prepare future planner-facing capability exposure.
export function getRegisteredFiles(index) {

    return Object.keys(index.files);
}
//synchronize retrieval metadata with sandbox capability, create deterministic initialization, prepare future indexing passes without hardcoding files repeatedly.
export function initializeRetrievalIndex() {

    const index = createRetrievalIndex();

    const allowedFiles = listAllowedFiles();

    for (const filename of allowedFiles) {

        registerFile(index, filename, {
            indexed: false,
            symbolsIndexed: false,
            chunksIndexed: false
        });

    }

    return index;
}
//Purpose: prepare deterministic chunk tracking, support future selective retrieval, avoid raw file dumping into AI context.
export function registerChunk(
    index,
    filename,
    chunkId,
    metadata = {}
) {

    index.chunks[chunkId] = {
        filename,
        chunkId,
        ...metadata
    };

    return index.chunks[chunkId];
}
//Purpose: deterministic chunk lookup, file-to-chunk mapping, future selective retrieval orchestration.
export function getChunksForFile(index, filename) {

    return Object.values(index.chunks)
        .filter(chunk => chunk.filename === filename);

}
//This is the first real chunk-indexing layer.
export async function buildFileChunks(
    index,
    filename,
    chunkSize = 20
) {

    const result = await readSandboxFile(filename);

const content = result.content;

    const lines = content.split("\n");

    let chunkCounter = 0;

    for (let i = 0; i < lines.length; i += chunkSize) {

        const chunkLines = lines.slice(i, i + chunkSize);

        const chunkId = `${filename}::chunk_${chunkCounter}`;

        registerChunk(index, filename, chunkId, {
            startLine: i + 1,
            endLine: i + chunkLines.length,
            lineCount: chunkLines.length
        });

        chunkCounter++;

    }

    index.files[filename].chunksIndexed = true;

    return getChunksForFile(index, filename);

}