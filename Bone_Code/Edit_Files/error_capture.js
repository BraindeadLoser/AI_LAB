"use strict";

/**
 * Extract validation error.
 */
function captureError(
  validationResult
) {
  if (
    !validationResult ||
    validationResult.success === true
  ) {
    return {
      hasError: false,
      errorText: null
    };
  }

  const errorText =
    Array.isArray(
      validationResult.errors
    )
      ? validationResult.errors.join(
          "\n"
        )
      : "";

  return {
    hasError: true,
    errorText
  };
}

export {
  captureError
};