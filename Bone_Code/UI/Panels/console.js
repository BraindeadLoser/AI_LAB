import DiffEngine from "../../Algorithms/diff_algorithm/diff_engine.js";
class Console extends EventTarget {
  constructor() {
    super();
    this.isDevelopMode = false;
    this.diffEngine = new DiffEngine();
  }

  // Set develop mode state
  setDevelopMode(state) {
    this.isDevelopMode = state;
  }

  // Get develop mode state
  getDevelopMode() {
    return this.isDevelopMode;
  }

  // Log a new entry
  log(level, source, payload) {
    // Only log if in develop mode
    if (!this.isDevelopMode) return;

    const entry = {
      level,
      source,
      payload,
      timestamp: new Date().toISOString()
    };

    // Dispatch a "log" event with the entry
    this.dispatchEvent(new CustomEvent('log', { detail: entry }));

    // Render the entry in the bottom console panel
    this.render(entry);
  }

  // Subscribe to events (like "log" or "suggestions")
  on(event, handler) {
    this.addEventListener(event, e => handler(e.detail));
  }

  // Emit custom events (like "suggestions")
  emit(event, data) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  // Render log entries into the bottom console panel
  render(entry) {
    const consoleDiv = document.getElementById('logs-content');
    if (consoleDiv) {
      const line = document.createElement('pre');
      line.textContent = JSON.stringify(entry, null, 2);
      consoleDiv.appendChild(line);
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
  }

  renderDiff(originalContent, patchedContent, file) {
    const diffContent =
      document.getElementById('diff-content');

    if (!diffContent) {
      return;
    }

const diffModel =
  this.diffEngine.buildDiffModel(
    originalContent,
    patchedContent
  );
    let html = "";

    html += `
      <div class="diff-file-header">
        File: ${file}
      </div>
    `;

    for (const item of diffModel) {
      if (item.type === "unchanged") {
        html += `
          <div class="diff-line">
            ${this.escapeHtml(item.text)}
          </div>
        `;
      }

      if (item.type === "removed") {
        html += `
          <div class="diff-line removed">
            ${this.escapeHtml(item.text)}
          </div>
        `;
      }

      if (item.type === "added") {
        html += `
          <div class="diff-line added">
            ${this.escapeHtml(item.text)}
          </div>
        `;
      }
    }

    diffContent.innerHTML = html;
   } 
   
   escapeHtml(text) {
    const div =
      document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
  }
}
// Export a singleton instance
export default new Console();
