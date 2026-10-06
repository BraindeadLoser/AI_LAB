"use strict";

/**
 * validation_runner.js
 *
 * Purpose:
 * Bridge between edit pipeline
 * and validation_container.py
 */

async function runValidation(
  workingCopy
) {
  const normalizedWorkingCopy =
    normalizeWorkingCopy(
      workingCopy
    );

  validateWorkingCopy(
    normalizedWorkingCopy
  );

  try {
    const result =
      await window.ipc.startValidationContainer({
        file:
          normalizedWorkingCopy.file,

        patchedContent:
          normalizedWorkingCopy.patchedContent
      });

    return {
      success:
        result.success,

      containerId:
        result.containerId || null,

      logs:
        result.logs || [],

      errors:
        result.errors || [],

      status:
        result.status
    };

  } catch (err) {
    return {
      success: false,

      containerId: null,

      logs: [],

      errors: [
        err.message ||
        String(err)
      ],

      status: "failed"
    };
  }
}

/**
 * Stop validation container.
 */
async function stopValidation(
  containerId
) {
  if (!containerId) {
    throw new Error(
      "validation_runner: containerId required."
    );
  }

  return await window.ipc.stopValidationContainer(
    containerId
  );
}

/**
 * Validate working copy.
 */
function normalizeWorkingCopy(
  workingCopy
) {
  if (!workingCopy) {
    return null;
  }

  const file =
    typeof workingCopy.file === "string"
      ? workingCopy.file
      : typeof workingCopy.filename === "string"
        ? workingCopy.filename
        : typeof workingCopy.path === "string"
          ? workingCopy.path
          : null;

  const patchedContent =
    typeof workingCopy.patchedContent === "string"
      ? workingCopy.patchedContent
      : typeof workingCopy.content === "string"
        ? workingCopy.content
        : null;

  return {
    ...workingCopy,
    file,
    patchedContent
  };
}

function validateWorkingCopy(
  workingCopy
) {
  if (!workingCopy) {
    throw new Error(
      "validation_runner: workingCopy required."
    );
  }

  if (
    typeof workingCopy.file !==
    "string"
  ) {
    throw new Error(
      "validation_runner: invalid file."
    );
  }

  if (
    typeof workingCopy.patchedContent !==
    "string"
  ) {
    throw new Error(
      "validation_runner: invalid patchedContent."
    );
  }
}

export {
  runValidation,
  stopValidation
};