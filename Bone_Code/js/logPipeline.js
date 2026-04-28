// logPipeline.js
export default class LogPipeline {
  constructor(aiModel) {
    this.aiModel = aiModel;
    this.buffer = [];
    this.maxBufferSize = 10; // adjust as needed
  }

  // Add a new log entry to the buffer
  add(entry) {
    this.buffer.push(entry);

    // If buffer is full, flush to AI
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
      const suggestions = await this.aiModel.analyzeLogs(batch);
      // Emit suggestions event for renderer to consume
      document.dispatchEvent(new CustomEvent('suggestions', { detail: suggestions }));
    } catch (err) {
      console.error('Pipeline flush error:', err);
    }
  }
}
