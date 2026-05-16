import { parseSymbols } from "./symbol_parser.js";
export async function registerFile(
    index,
    filename,
    content,
    metadata = {}
) {
    if (!index.files) {
        index.files = {};
    }

    index.files[filename] = {
        filename,
        ...metadata
    };

    // Parse symbols deterministically
    const symbols = parseSymbols(filename, content);
    index.files[filename].symbolCount = symbols.length;

    symbols.forEach(sym => {
        sym.file = filename;
        registerSymbol(index, sym);
    });

    index.files[filename].symbolsIndexed = true;

    return index.files[filename];
}
//Purpose: create deterministic retrieval visibility, avoid direct internal structure access later, prepare future planner-facing capability exposure.
export function getRegisteredFiles(index) {
    return Object.keys(index.files);
}
// define createRetrievalIndex first
export function createRetrievalIndex() {
  return {
    files: {},
    symbols: {},
    chunks: {}
  };
}
//synchronize retrieval metadata with sandbox capability, create deterministic initialization, prepare future indexing passes without hardcoding files repeatedly.
export function initializeRetrievalIndex() {

    return createRetrievalIndex();
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
    content,
    chunkSize = 20
) {
    const lines = content.split("\n");
    
    if (!index.files[filename]) {

    index.files[filename] = {
        filename,
        indexed: false,
        symbolsIndexed: false,
        chunksIndexed: false
    };
}

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

export function registerSymbol(index, symbol) {

    if (!index.symbols) {
        index.symbols = {};
    }

    const key = `${symbol.file}::${symbol.name}`;

    index.symbols[key] = symbol;

    return index.symbols[key];
}

export function getSymbol(index, filename, symbolName) {

    const key = `${filename}::${symbolName}`;

    return index.symbols[key] || null;
}

export function extractSymbolRegion(
    content,
    symbol
) {

    const lines = content.split(/\r?\n/);

    const selected = lines.slice(
        symbol.startLine - 1,
        symbol.endLine
    );

    return {
        startLine: symbol.startLine,
        endLine: symbol.endLine,
        content: selected.join("\n")
    };
}

export function retrieveSymbolContext(
    index,
    filename,
    content,
    symbolName
) {

    const symbol = getSymbol(
        index,
        filename,
        symbolName
    );

    if (!symbol) {
        return null;
    }

    const region = extractSymbolRegion(
        content,
        symbol
    );

    return {
        file: filename,

        symbol: {
            type: symbol.type,
            name: symbol.name
        },

        region
    };
}