// logPipeline.js
export default class LogPipeline {
  constructor(aiModelUrl) {
    this.aiModelUrl = aiModelUrl; // e.g. "http://127.0.0.1:1234"
    this.buffer = [];
    this.maxBufferSize = 10; // adjust as needed
  }

  // Add a new log entry to buffer and console
  add(entry) {
    this.buffer.push(entry);

    // Render to bottom console panel
    const consoleDiv = document.getElementById('bottom-console');
    if (consoleDiv) {
      const line = document.createElement('div');
      line.textContent = `[${entry.source}] ${JSON.stringify(entry.payload)}`;
      consoleDiv.appendChild(line);
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    // Auto-flush if buffer full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  // Flush buffered logs to AI model
  async flush() {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      const response = await fetch(this.aiModelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze these logs:\n${JSON.stringify(batch, null, 2)}`,
          max_tokens: 200
        })
      });

      const data = await response.json();

      // Emit suggestions event for renderer to consume
      if (data && data.output) {
        document.dispatchEvent(
          new CustomEvent("suggestions", { detail: data.output })
        );
      }
    } catch (err) {
      console.error("Pipeline flush error:", err);
    }
  }
}
