type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

export function isMarketingCopilotConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getMarketingCopilotModel(): string {
  return process.env.MARKETING_COPILOT_MODEL?.trim() || "gpt-4o-mini";
}

/**
 * Calls OpenAI Chat Completions with JSON object mode. Throws on network/HTTP/parse errors.
 */
export async function openAiChatJsonObject(params: {
  system: string;
  user: string;
}): Promise<unknown> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getMarketingCopilotModel(),
      temperature: 0.55,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
  });

  const raw = (await res.json()) as ChatCompletionResponse;
  if (!res.ok) {
    const msg = raw.error?.message ?? `OpenAI request failed (${res.status}).`;
    throw new Error(msg);
  }

  const text = raw.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty model response.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Model returned non-JSON content.");
  }
}
