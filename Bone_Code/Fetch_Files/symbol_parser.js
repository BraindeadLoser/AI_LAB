export function parseSymbols(filename, content) {

    const language = detectLanguage(filename);

    switch (language) {

        case "python":
            return parsePythonSymbols(content);

        case "javascript":
            return parseJavaScriptSymbols(content);

        case "java":
            return parseJavaSymbols(content);

        case "go":
            return parseGoSymbols(content);

        case "ruby":
            return parseRubySymbols(content);

        default:
            return [];
    }
}

function detectLanguage(filename) {

    const lower = filename.toLowerCase();

    if (lower.endsWith(".py")) return "python";
    if (lower.endsWith(".js")) return "javascript";
    if (lower.endsWith(".java")) return "java";
    if (lower.endsWith(".go")) return "go";
    if (lower.endsWith(".rb")) return "ruby";

    return "unknown";
}

function createSymbol({
    type,
    name,
    startLine,
    endLine
}) {
    return {
        type,
        name,
        startLine,
        endLine
    };
}

function parsePythonSymbols(content) {

    const lines = content.split(/\r?\n/);

    const symbols = [];

    for (let i = 0; i < lines.length; i++) {

        const line = lines[i];

        const match = line.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);

        if (!match) {
            continue;
        }

        const name = match[1];

        const startLine = i + 1;

        let endLine = lines.length;

        const baseIndent =
            line.match(/^(\s*)/)[1].length;

        for (let j = i + 1; j < lines.length; j++) {

            const nextLine = lines[j];

            if (nextLine.trim() === "") {
                continue;
            }

            const indent =
                nextLine.match(/^(\s*)/)[1].length;

            if (indent <= baseIndent) {
                endLine = j;
                break;
            }
        }

        symbols.push(
            createSymbol({
                type: "function",
                name,
                startLine,
                endLine
            })
        );
    }

    return symbols;
}

function parseJavaScriptSymbols(content) {
    return [];
}

function parseJavaSymbols(content) {
    return [];
}

function parseGoSymbols(content) {
    return [];
}

function parseRubySymbols(content) {
    return [];
}