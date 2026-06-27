class DiffEngine {
  computeLCSMatrix(oldLines, newLines) {
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
  const matrix = this.computeLCSMatrix(oldLines, newLines);

  let i = oldLines.length;
  let j = newLines.length;

  const operations = [];

  while (i > 0 && j > 0) {
    const oldText = (oldLines[i - 1] || "").replace(/\r/g, "");
    const newText = (newLines[j - 1] || "").replace(/\r/g, "");

    if (oldText === newText) {
      operations.push({
        type: "unchanged",
        oldLine: i,
        newLine: j,
        text: oldLines[i - 1]
      });

      i--;
      j--;
    }
    else if (matrix[i - 1][j] >= matrix[i][j - 1]) {
      operations.push({
        type: "removed",
        oldLine: i,
        newLine: null,
        text: oldLines[i - 1]
      });

      i--;
    }
    else {
      operations.push({
        type: "added",
        oldLine: null,
        newLine: j,
        text: newLines[j - 1]
      });

      j--;
    }
  }

  while (i > 0) {
    operations.push({
      type: "removed",
      oldLine: i,
      newLine: null,
      text: oldLines[i - 1]
    });

    i--;
  }

  while (j > 0) {
    operations.push({
      type: "added",
      oldLine: null,
      newLine: j,
      text: newLines[j - 1]
    });

    j--;
  }

  operations.reverse();

  return operations;
}

  buildDiffModel(originalContent, patchedContent) {
    const oldLines = (originalContent || "").split("\n");
    const newLines = (patchedContent || "").split("\n");

    return this.computeDiffOperations(oldLines, newLines);
  }
}

export default DiffEngine;