// src/components/callWeatherAgent.js
export async function callWeatherAgent(
  text,
  { endpoint, threadId, onMessage, signal } = {}
) {
  if (!endpoint)
    throw new Error("Please provide endpoint for callWeatherAgent");

  const body = {
    messages: [{ role: "user", content: text }],
    runId: "weatherAgent",
    maxRetries: 2,
    maxSteps: 5,
    temperature: 0.5,
    topP: 1,
    runtimeContext: {},
    threadId: threadId || "vu5f2122045",
    resourceId: "weatherAgent",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mastra-dev-playground": "true",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }

  // --- Stream reader ---
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let assistantText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    const chunk = decoder.decode(value, { stream: true });

    // Split into lines, ignore empty
    const lines = chunk.split("\n").filter(Boolean);

    for (const line of lines) {
      // ✅ Only care about `0:"..."` tokens
      if (line.startsWith("0:")) {
        const match = line.match(/0:"(.+)"/);
        if (match) {
          assistantText += match[1];
          if (onMessage) onMessage(assistantText); // live updates (optional)
        }
      }
    }
  }

  return assistantText.trim();
}
