"use strict";

const {
  captureError
} = require("../../Bone_Code/Edit_Files/error_capture.js");

const validationResult = {
  success: false,
  containerId: "test-container",
  status: "failed",
  logs: [
    "SyntaxError: '(' was never closed"
  ],
  errors: [
    "SyntaxError: '(' was never closed"
  ]
};

const capturedError =
  captureError(
    validationResult
  );

console.log(
  "\nValidation Result:\n"
);

console.log(
  validationResult
);

console.log(
  "\nCaptured Error:\n"
);

console.log(
  capturedError
);