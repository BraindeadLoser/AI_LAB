import { initializeRetrievalIndex, registerFile } from "./Fetch_Files/retrieval_index.js";
import fs from "fs/promises";

async function runTest() {
  try {
    const index = initializeRetrievalIndex();

    // Read file content directly from disk
    const content = await fs.readFile("./js/sample.py", "utf-8");

    // Register the file content into the index
    await registerFile(index, "sample.py", { indexed: true }, content);

    console.log("Files registered:", Object.keys(index.files));
    console.log("Symbols count:", Object.keys(index.symbols).length);
    console.log("Chunks count:", Object.keys(index.chunks).length);
  } catch (err) {
    console.error("Pipeline test failed:", err);
  }
}

runTest();
