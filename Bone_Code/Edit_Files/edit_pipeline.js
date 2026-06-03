"use strict";

import {readSandboxFile} from "../Fetch_Files/file_access.js";
import { createPatch } from "../Edit_Files/patch_engine.js";
import { applyPatch } from "../Edit_Files/apply_patch.js";
import { runValidation } from "../Edit_Files/validation_runner.js";

export async function generateEditContent(
  retrieval,
  instruction
) {
  console.log(
  "[EDIT_PIPELINE] LM input:",
  {
    retrievalContent:
      retrieval?.content,
    instruction
  }
);
  const response = await fetch(
    "http://127.0.0.1:1234/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
    role: "system",
    content:
`You are a strict code editing engine.

You receive REAL file contents and a user instruction.

Your job is to modify the REAL codebase safely.

REAL_FILE_CONTENT is the ONLY source of truth.

EDITING RULES

You MUST:
- modify ONLY the retrieved code
- preserve valid syntax
- preserve unrelated logic
- preserve imports unless modification requires change
- preserve formatting style when possible
- make the minimum necessary edit
- obey the user's instruction precisely

You are STRICTLY FORBIDDEN from:
- hallucinating new architecture
- rewriting the entire file unnecessarily
- inventing missing functions/classes
- changing unrelated behavior
- inserting placeholder code
- removing working logic without reason
- using prior assumptions about the project

OUTPUT RULES

- return ONLY final replacement code
- no markdown
- no explanations
- no comments describing edits
- no prose
- no code fences

GROUNDING POLICY

You MUST edit ONLY using REAL_FILE_CONTENT.

If instruction ambiguity exists:
prefer minimal safe edits.

Never invent unseen project context.`
},
          {
            role: "system",
            content:
`REAL_FILE_CONTENT:

${retrieval.content}`
          },
          {
            role: "user",
            content: instruction
          }
        ],
        stream: false
      })
    }
  );

  const data =
    await response.json();

const raw =
  data?.choices?.[0]
    ?.message?.content || "";

return raw
  .replace(/```python/g, "")
  .replace(/```/g, "")
  .trim();
}

export async function finalizeEdit(
  filename,
  instruction
) 
{
  try {
    // 1. Retrieve real file content
const retrieval =
  await readSandboxFile(
    filename
  );

    // 2. Generate edited code
    const editedContent =
      await generateEditContent(
        retrieval,
        instruction
      );

    // 3. Build patch
    const patch =
      createPatch({
        retrieval,
        newContent:
          editedContent
      });

    // 4. Apply patch
    const workingCopy =
      applyPatch(patch);

    // 5. Run validation
    const validationResult =
      await runValidation(
        workingCopy
      );

    // 6. Return orchestration result
    return {
      success: true,
      retrieval,
      editedContent,
      patch,
      workingCopy,
      validationResult
    };

  } catch (err) {
    console.error(
      "[EDIT_PIPELINE] error:",
      err
    );

    return {
      success: false,
      error:
        err.message ||
        String(err)
    };
  }
}