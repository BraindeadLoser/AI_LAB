// aiConnector.js
export default class AIConnector {
  constructor(baseUrl) {
    this.baseUrl = baseUrl; // e.g. "http://127.0.0.1:1234"
  }

  // Generic send method for chat or single log
  async send(prompt) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        max_tokens: 200
      })
    });

    const data = await response.json();
    return data.output || data; // LM Studio returns { output: "..."}
  }

  // Specialized method for log batches
  async analyzeLogs(batch) {
    const prompt = `Analyze these logs:\n${JSON.stringify(batch, null, 2)}`;
    return await this.send(prompt);
  }
}
