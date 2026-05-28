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
  validateWorkingCopy(
    workingCopy
  );

  try {
    const result =
      await window.ipc.startValidationContainer({
        file:
          workingCopy.file,

        patchedContent:
          workingCopy.patchedContent
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