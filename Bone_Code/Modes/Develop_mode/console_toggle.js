export function initializeConsoleToggle() {
  document
    .getElementById("consoleToggleBtn")
    .addEventListener("click", () => {
      const consoleDiv =
        document.getElementById("bottom-console");

      if (consoleDiv.classList.contains("hidden")) {
        consoleDiv.classList.remove("hidden");
      } else {
        consoleDiv.classList.add("hidden");
      }
    });
}