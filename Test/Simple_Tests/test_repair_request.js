"use strict";

const {
  repairRequest
} = require("../../Bone_Code/AI/repair_request.js");

async function runTest() {
  const repairedCode =
    await repairRequest({
      originalContent:
`print("hello")`,

      editedContent:
`print("hello"`,

      instruction:
`Add a print statement`,

      errorText:
`SyntaxError: '(' was never closed`
    });

  console.log(
    "\n=== REPAIRED CODE ===\n"
  );

  console.log(
    repairedCode
  );
}

runTest().catch(
  console.error
);