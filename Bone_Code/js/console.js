// console.js
class Console extends EventTarget {
  constructor() {
    super();
    this.isDevelopMode = false;
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
    const consoleDiv = document.getElementById('bottom-console');
    if (consoleDiv) {
      const line = document.createElement('pre');
      line.textContent = JSON.stringify(entry, null, 2);
      consoleDiv.appendChild(line);
      consoleDiv.scrollTop = consoleDiv.scrollHeight; // auto-scroll
    }
  }
}

// Export a singleton instance
export default new Console();
