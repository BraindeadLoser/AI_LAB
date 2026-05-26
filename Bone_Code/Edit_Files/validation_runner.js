"use strict";

/**
 * validation_runner.js
 *
 * Purpose:
 * Run patched code in a temporary Docker container
 * without touching the original running app.
 *
 * Input:
 * workingCopy
 *
 * Output:
 * {
 *   success,
 *   containerId,
 *   status
 * }
 */

/**
 * Launch temporary validation container.
 */
async function startValidation(
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
      success: true,

      containerId:
        result.containerId,

      status:
        "running"
    };
  } catch (err) {
    return {
      success: false,

      error:
        err.message || String(err),

      status:
        "failed"
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

  await window.ipc.stopValidationContainer(
    containerId
  );

  return {
    success: true,
    status: "stopped"
  };
}

/**
 * Validate working copy.
 */
function validateWorkingCopy(
  workingCopy
) {
  if (
    !workingCopy ||
    typeof workingCopy !== "object"
  ) {
    throw new Error(
      "validation_runner: invalid workingCopy."
    );
  }

  const requiredFields = [
    "file",
    "patchedContent",
    "originalContent"
  ];

  for (const field of requiredFields) {
    if (!(field in workingCopy)) {
      throw new Error(
        `validation_runner: missing '${field}'.`
      );
    }
  }
}

export {
  startValidation,
  stopValidation
};