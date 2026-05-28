"use strict";

import {
  stopValidation
} from "./validation_runner.js";

/**
 * Save approved changes.
 */
async function saveChanges(
  workingCopy,
  containerId
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

    if (containerId) {
      await stopValidation(
        containerId
      );
    }

    return {
      success: true,
      file:
        workingCopy.file,
      status: "saved"
    };

  } catch (err) {
    return {
      success: false,
      error:
        err.message ||
        String(err),
      status: "failed"
    };
  }
}

/**
 * Reject changes.
 */
async function rejectChanges(
  containerId
) {
  try {
    if (containerId) {
      await stopValidation(
        containerId
      );
    }

    return {
      success: true,
      status: "rejected"
    };

  } catch (err) {
    return {
      success: false,
      error:
        err.message ||
        String(err),
      status: "failed"
    };
  }
}

function validateWorkingCopy(
  workingCopy
) {
  if (!workingCopy) {
    throw new Error(
      "save_changes: workingCopy required."
    );
  }

  if (
    typeof workingCopy.file !==
    "string"
  ) {
    throw new Error(
      "save_changes: invalid file."
    );
  }

  if (
    typeof workingCopy.patchedContent !==
    "string"
  ) {
    throw new Error(
      "save_changes: invalid patchedContent."
    );
  }
}

export {
  saveChanges,
  rejectChanges
};