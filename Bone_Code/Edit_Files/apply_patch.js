"use strict";

/**
 * apply_patch.js
 *
 * Purpose:
 * Create an in-memory working copy
 * using original content +
 * AI edited content.
 */

/**
 * Apply patch in memory.
 */
function applyPatch(patch) {
  if (!patch) {
    throw new Error(
      "apply_patch: patch required."
    );
  }

  if (
    typeof patch.oldContent !==
    "string"
  ) {
    throw new Error(
      "apply_patch: invalid oldContent."
    );
  }

  if (
    typeof patch.newContent !==
    "string"
  ) {
    throw new Error(
      "apply_patch: invalid newContent."
    );
  }

  return {
    file:
      patch.file,

    originalContent:
      patch.oldContent,

    patchedContent:
      patch.newContent,

    applied: true
  };
}

export {
  applyPatch
};