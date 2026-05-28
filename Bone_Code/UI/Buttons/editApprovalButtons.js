"use strict";

import {
  saveChanges,
  rejectChanges
} from "../../Edit_Files/save_changes.js";

/**
 * Render Accept / Reject buttons
 * only for AI edit proposals.
 */
export function renderEditApprovalButtons(
  parentElement,
  workingCopy,
  containerId
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

  wrapper.appendChild(
    acceptButton
  );

  wrapper.appendChild(
    rejectButton
  );

  parentElement.appendChild(
    wrapper
  );
}