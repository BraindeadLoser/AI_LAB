"use strict";

/**
 * save_changes.js
 *
 * Purpose:
 * Persist approved changes to disk
 * only after user acceptance.
 *
 * Input:
 * workingCopy
 *
 * Output:
 * {
 *   success,
 *   file,
 *   status
 * }
 */

/**
 * Save approved changes.
 */
async function saveChanges(
  workingCopy
) {
  validateWorkingCopy(
    workingCopy
  );

  try {
    await window.ipc.savePatchedFile({
      file:
        workingCopy.file,

      content:
        workingCopy.patchedContent
    });

    return {
      success: true,

      file:
        workingCopy.file,

      status:
        "saved"
    };
  } catch (err) {
    return {
      success: false,

      error:
        err.message ||
        String(err),

      status:
        "failed"
    };
  }
}

/**
 * Reject changes.
 *
 * Nothing is written.
 * Memory state gets discarded.
 */
async function rejectChanges(
  containerId
) {
  if (containerId) {
    await window.ipc.stopValidationContainer(
      containerId
    );
  }

  return {
    success: true,
    status: "rejected"
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
      "save_changes: invalid workingCopy."
    );
  }

  const requiredFields = [
    "file",
    "patchedContent"
  ];

  for (const field of requiredFields) {
    if (!(field in workingCopy)) {
      throw new Error(
        `save_changes: missing '${field}'.`
      );
    }
  }
}

export {
  saveChanges,
  rejectChanges
};