"use strict";

/**
 * patch_engine.js
 *
 * Purpose:
 * Convert retrieved file context + AI edit proposal
 * into a deterministic patch object.
 *
 * Input:
 * {
 *   retrieval: {
 *     file,
 *     startLine,
 *     endLine,
 *     content
 *   },
 *   newContent
 * }
 *
 * Output schema:
 * {
 *   file: "renderer.js",
 *   operation: "replace",
 *   oldContent: "...",
 *   newContent: "...",
 *   diff: [...]
 * }
 */

/**
 * Validate incoming retrieval object.
 */
function validateRetrieval(retrieval) {
  if (!retrieval || typeof retrieval !== "object") {
    throw new Error(
      "patch_engine: retrieval object required."
    );
  }

  const requiredFields = [
    "file",
    "startLine",
    "endLine",
    "content"
  ];

  for (const field of requiredFields) {
    if (!(field in retrieval)) {
      throw new Error(
        `patch_engine: retrieval missing '${field}'.`
      );
    }
  }

  if (typeof retrieval.file !== "string") {
    throw new Error(
      "patch_engine: invalid retrieval file."
    );
  }

  if (
    typeof retrieval.startLine !== "number" ||
    typeof retrieval.endLine !== "number"
  ) {
    throw new Error(
      "patch_engine: invalid line boundaries."
    );
  }

  if (typeof retrieval.content !== "string") {
    throw new Error(
      "patch_engine: retrieval content must be string."
    );
  }
}

/**
 * Validate patch input.
 */
function validatePatchInput({
  retrieval,
  newContent
}) {
  validateRetrieval(retrieval);

  if (typeof newContent !== "string") {
    throw new Error(
      "patch_engine: newContent must be string."
    );
  }
}

/**
 * Generate deterministic line diff.
 */
function generateDiff(
  oldContent,
  newContent
) {
  const oldLines =
    oldContent.split(/\r?\n/);

  const newLines =
    newContent.split(/\r?\n/);

  const maxLength = Math.max(
    oldLines.length,
    newLines.length
  );

  const diff = [];

  for (let i = 0; i < maxLength; i++) {
    const oldLine =
      oldLines[i] ?? null;

    const newLine =
      newLines[i] ?? null;

    if (oldLine !== newLine) {
      diff.push({
        line:
          i + 1,
        oldLine,
        newLine
      });
    }
  }

  return diff;
}

/**
 * Create normalized patch object.
 */
function createPatch({
  retrieval,
  newContent
}) {
  validatePatchInput({
    retrieval,
    newContent
  });

  const oldContent =
    retrieval.content;

  const diff =
    generateDiff(
      oldContent,
      newContent
    );

  return {
    file:
      retrieval.file,

    operation:
      "replace",

    oldContent,

    newContent,

    diff
  };
}

/**
 * Validate final patch object.
 */
function validatePatchObject(
  patch
) {
  if (
    !patch ||
    typeof patch !== "object"
  ) {
    throw new Error(
      "patch_engine: invalid patch object."
    );
  }

  const requiredFields = [
    "file",
    "operation",
    "oldContent",
    "newContent",
    "diff"
  ];

  for (const field of requiredFields) {
    if (!(field in patch)) {
      throw new Error(
        `patch_engine: missing '${field}'.`
      );
    }
  }

  if (
    patch.operation !==
    "replace"
  ) {
    throw new Error(
      "patch_engine: unsupported operation."
    );
  }

  return true;
}

exports = {
  createPatch,
  validatePatchInput,
  validatePatchObject,
  generateDiff
};