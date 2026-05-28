"use strict";

/**
 * patch_engine.js
 *
 * Purpose:
 * Convert retrieved file content +
 * AI edited content into
 * a normalized patch object.
 */

/**
 * Create patch object.
 */
function createPatch({
  retrieval,
  newContent
}) {
  if (!retrieval) {
    throw new Error(
      "patch_engine: retrieval required."
    );
  }

  if (
    typeof retrieval.content !==
    "string"
  ) {
    throw new Error(
      "patch_engine: invalid retrieval content."
    );
  }

  if (
    typeof newContent !==
    "string"
  ) {
    throw new Error(
      "patch_engine: newContent must be string."
    );
  }

  return {
    file:
      retrieval.file || retrieval.filename,

    oldContent:
      retrieval.content,

    newContent
  };
}

export {
  createPatch
};