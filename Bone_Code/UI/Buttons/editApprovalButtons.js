"use strict";

import {
  saveChanges,
  rejectChanges
} from "../../Edit_Files/save_changes.js";

import {
  generateEditContent
} from "../../Edit_Files/edit_pipeline.js";

import {
  createPatch
} from "../../Edit_Files/patch_engine.js";

import {
  applyPatch
} from "../../Edit_Files/apply_patch.js";

import {
  runValidation
} from "../../Edit_Files/validation_runner.js";

/**
 * Render Accept / Reject buttons
 * only for AI edit proposals.
 */
export function renderEditApprovalButtons(
  parentElement,
  workingCopy,
  containerId,
  retrieval,
  instruction
) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    "edit-approval-buttons";

  const acceptButton =
    document.createElement("button");

  acceptButton.innerText =
    "Accept";

const rejectButton =
  document.createElement("button");

rejectButton.innerText =
  "Reject";

const retryButton =
  document.createElement("button");

retryButton.innerText =
  "Retry";

  acceptButton.onclick =
    async () => {

      const result =
        await saveChanges(
          workingCopy,
          containerId
        );

      console.log(
        "[EDIT_APPROVAL] saved:",
        result
      );

      wrapper.remove();
    };

rejectButton.onclick =
  async () => {

    const result =
      await rejectChanges(
        containerId
      );

    console.log(
      "[EDIT_APPROVAL] rejected:",
      result
    );

    wrapper.remove();
  };

retryButton.onclick =
  async () => {

    console.log(
      "[EDIT_APPROVAL] retry clicked"
    );

    const result =
      await rejectChanges(
        containerId
      );

    console.log(
      "[EDIT_APPROVAL] retry cleanup:",
      result
    );

    wrapper.remove();

const editedContent =
  await generateEditContent(
    retrieval,
    instruction
  );

console.log(
  "[EDIT_APPROVAL] retry edit generated:",
  editedContent
);

const patch =
  createPatch({
    retrieval,
    newContent:
      editedContent
  });

const workingCopy =
  applyPatch(
    patch
  );

const validationResult =
  await runValidation(
    workingCopy
  );

console.log(
  "[EDIT_APPROVAL] retry validation:",
  validationResult
);

if (
  validationResult?.success
) {

  renderEditApprovalButtons(
    parentElement,
    workingCopy,
    validationResult.containerId,
    retrieval,
    instruction
  );
}
  };

wrapper.appendChild(
  acceptButton
);

wrapper.appendChild(
  rejectButton
);

wrapper.appendChild(
  retryButton
);

parentElement.appendChild(
  wrapper
);
}