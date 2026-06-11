"use strict";

async function repairRequest(
  {
    originalContent,
    editedContent,
    instruction,
    errorText
  }
) {
  const response =
    await fetch(
      "http://127.0.0.1:1234/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
`You are an automatic code repair engine.

A code edit was generated but failed validation.

Fix the code using the validation error.

Rules:
- preserve the user's instruction
- preserve unrelated code
- make the minimum necessary repair
- return only repaired code
- no markdown
- no explanations
- no code fences`
            },
            {
              role: "user",
              content:
`USER_INSTRUCTION:

${instruction}

VALIDATION_ERROR:

${errorText}

EDITED_CODE:

${editedContent}`
            }
          ],
          stream: false
        })
      }
    );

  const data =
    await response.json();

  const repairedCode =
    data?.choices?.[0]
      ?.message?.content || "";

  return repairedCode
    .replace(/```python/g, "")
    .replace(/```/g, "")
    .trim();
}

export {
  repairRequest
};