"use strict";

import {
  captureError
} from "./error_capture.js";

import {
  repairRequest
} from "../AI/repair_request.js";

import {
  runValidation,
  stopValidation
} from "./validation_runner.js";

export async function repairLoop(
  {
    retrieval,
    editedContent,
    instruction,
    validationResult
  }
) {
  let currentContent =
    editedContent;

  let currentValidation =
    validationResult;

let attempts = 0;

while (
  attempts < 2
) {
  const capturedError =
    captureError(
      currentValidation
    );

  if (
    !capturedError.hasError
  ) {
    break;
  }
  attempts++;
  currentContent =
    await repairRequest({
      originalContent:
        retrieval.content,

      editedContent:
        currentContent,

      instruction,

      errorText:
        capturedError.errorText
    });

  currentValidation =
    await runValidation({
      file:
        retrieval.file,

      patchedContent:
        currentContent
    });

  if (
    currentValidation.containerId
  ) {
    await stopValidation(
      currentValidation.containerId
    );
  }
}

  return {
    success: currentValidation.success,
    repairedContent: currentContent,
    validationResult: currentValidation,
    attempts,
    message: !currentValidation.success && attempts >= 2
      ? "Validation failed after maximum repair attempts."
      : null
  };

}