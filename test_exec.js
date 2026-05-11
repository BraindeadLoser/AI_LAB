// test_exec.js
const { execFile } = require("child_process");

execFile("python", ["Tools/docker_testing.py", "read", "sample.py"], (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("=== NODE TEST SCRIPT ===");
  console.log("RAW STDOUT LENGTH:", stdout.length);
  console.log("RAW STDOUT BYTES:", Buffer.from(stdout));
  console.log("RAW STDOUT CONTENT:\n", stdout);
  console.log("========================");
});
