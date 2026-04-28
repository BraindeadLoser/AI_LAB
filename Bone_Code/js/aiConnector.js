// aiConnector.js
export default class AIConnector {
  constructor(baseUrl, modelName) {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
  }

  async requestSuggestions(logBatch) {
    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        prompt: `Analyze these logs and suggest code improvements:\n${JSON.stringify(logBatch, null, 2)}`,
        max_tokens: 200
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.text || "No suggestion returned.";
  }

  async chat(prompt) {
    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        prompt,
        max_tokens: 300
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.text || "No reply.";
  }
}
