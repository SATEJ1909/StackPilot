

const MODELS = [
  "google/gemini-2.0-flash-001",      // Cutting edge, best at JSON
  "deepseek/deepseek-chat",            // DeepSeek-V3 is excellent for logic
  "qwen/qwen-2.5-72b-instruct", 
  "openrouter/auto"                    // Let OpenRouter decide if others fail
];

const SYSTEM_PROMPT = `
You are a Senior SRE and Full-Stack Engineer.
Analyze the error provided and return a root-cause analysis in STRICT JSON.

Required JSON Schema:
{
  "type": "frontend" | "backend" | "fullstack",
  "reasoning": "Technical explanation of the error flow",
  "cause": "The specific breaking point (e.g., 'API returned 404', 'null pointer in useEffect')",
  "fix": ["Step-by-step technical fix 1", "Step-by-step technical fix 2"],
  "severity": "low" | "medium" | "high"
}

Constraints:
- No conversational filler.
- No markdown code blocks.
- Focus on architectural failure points.
`;

const parseModelResponse = (raw: string) => {
  try {
    // Some models still wrap in markdown even when told not to
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    return null;
  }
};

const isValidResponse = (data: any) => {
  const keys = ["type", "reasoning", "cause", "fix", "severity"];
  return keys.every(key => !!data?.[key]) && Array.isArray(data.fix);
};

export const analyzeError = async (data: {
  message: string;
  stack?: string;
  route?: string;
}) => {
  const { message, stack, route } = data;

  for (const model of MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per model

    try {
      console.log(`Querying model: ${model}`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Error Analyzer Service", // Helpful for OpenRouter logs
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Route: ${route || "/"}\nError: ${message}\nStack: ${stack || "N/A"}` }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }, // KEY: Forces JSON mode
          max_tokens: 500
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const result = await response.json();
      const raw = result?.choices?.[0]?.message?.content;
      
      if (!raw) continue;

      const parsed = parseModelResponse(raw);
      if (isValidResponse(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.log(`Model ${model} skipped due to error/timeout`);
      continue;
    }
  }

  // Final emergency fallback
  return {
    type: "fullstack",
    reasoning: "Automated analysis reached end of retry chain.",
    cause: "Multiple AI models failed to provide a valid diagnosis.",
    fix: ["Manually inspect logs for: " + message.substring(0, 50)],
    severity: "medium"
  };
};
