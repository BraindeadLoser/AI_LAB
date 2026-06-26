class DiffEngine {
  computeLCS(oldLines, newLines) {
    const rows = oldLines.length + 1;
    const cols = newLines.length + 1;
    const matrix = [];

    for (let i = 0; i < rows; i++) {
      matrix.push(new Array(cols).fill(0));
    }

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const oldText = (oldLines[i - 1] || "").replace(/\r/g, "");
        const newText = (newLines[j - 1] || "").replace(/\r/g, "");

        if (oldText === newText) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }

    return matrix;
  }

  computeDiffOperations(oldLines, newLines) {
    const maxLines = Math.max(oldLines.length, newLines.length);
    const operations = [];

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        if (oldLine !== undefined) {
          operations.push({
            type: "unchanged",
            oldLine: i + 1,
            newLine: i + 1,
            text: oldLine
          });
        }
      } else {
        if (oldLine !== undefined) {
          operations.push({
            type: "removed",
            oldLine: i + 1,
            newLine: null,
            text: oldLine
          });
        }

        if (newLine !== undefined) {
          operations.push({
            type: "added",
            oldLine: null,
            newLine: i + 1,
            text: newLine
          });
        }
      }
    }

    return operations;
  }

  buildDiffModel(originalContent, patchedContent) {
    const oldLines = (originalContent || "").split("\n");
    const newLines = (patchedContent || "").split("\n");

    return this.computeDiffOperations(oldLines, newLines);
  }
}

export default DiffEngine;