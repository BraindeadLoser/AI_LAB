"use strict";

/**
 * apply_patch.js
 *
 * Purpose:
 * Apply a patch object in memory only.
 *
 * Input patch schema:
 * {
 *   file,
 *   operation: "replace",
 *   oldContent,
 *   newContent,
 *   diff
 * }
 *
 * Output:
 * {
 *   file,
 *   originalContent,
 *   patchedContent,
 *   patch,
 *   applied
 * }
 */

/**
 * Validate incoming patch.
 */
function validatePatch(patch) {
  if (!patch || typeof patch !== "object") {
    throw new Error(
      "apply_patch: patch object required."
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
        `apply_patch: missing '${field}'.`
      );
    }
  }

  if (patch.operation !== "replace") {
    throw new Error(
      "apply_patch: unsupported operation."
    );
  }
}

/**
 * Apply patch in memory.
 */
function applyPatch(patch) {
  validatePatch(patch);

  const workingCopy = {
    file: patch.file,

    originalContent:
      patch.oldContent,

    patchedContent:
      patch.newContent,

    patch,

    applied: true
  };

  return workingCopy;
}

export {
  applyPatch
};