import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import { retrieveAssistantChunks } from "@/lib/assistant/assistant-retrieval";
import { assistantSourceRegistry } from "@/lib/assistant/assistant-source-registry";
import type { AssistantAnswer } from "@/lib/assistant/assistant-types";

function fallbackAnswer(question: string): AssistantAnswer {
  const q = question.toLowerCase();
  const source =
    q.includes("trust") || q.includes("safe") || q.includes("policy")
      ? assistantSourceRegistry.find((s) => s.id === "trust-safety-and-help")
      : q.includes("auction") || q.includes("buy") || q.includes("sell")
        ? assistantSourceRegistry.find((s) => s.id === "auctions-buying-and-selling")
        : assistantSourceRegistry.find((s) => s.id === "platform-overview");

  return {
    answer:
      "I’m not confident enough to answer that from the current Carasta knowledge set. The best next step is to open the closest help page or contact Carasta directly if you need support beyond general product guidance.",
    confidence: "low",
    shouldEscalate: true,
    suggestedQuestions: [
      "What is Carasta?",
      "What is Carmunity?",
      "How do auctions work on Carasta?",
      "Where should I go for help?",
    ],
    citations: source
      ? [
          {
            sourceId: source.id,
            title: source.title,
            href: source.href,
          },
        ]
      : [],
  };
}

export async function answerCarastaAssistantQuestion(
  question: string
): Promise<{
  answer: AssistantAnswer;
  matchedChunks: Awaited<ReturnType<typeof retrieveAssistantChunks>>;
}> {
  const matchedChunks = await retrieveAssistantChunks(question, 6);
  if (matchedChunks.length === 0) {
    return { answer: fallbackAnswer(question), matchedChunks };
  }

  const raw = await openAiChatJsonObject({
    system: `You are the Carasta Assistant, a bounded site-specific help assistant.

Rules:
- Answer only from the retrieved Carasta source chunks.
- Do not give legal advice.
- Do not fabricate policy certainty, fees, account-specific state, or moderation decisions.
- If the sources are insufficient, say so clearly and prefer a low-confidence fallback.
- Cite only sourceId values that appear in the retrieved source list.
- Keep the answer concise, helpful, and specific to Carasta.

Return one JSON object with:
{
  "answer": string,
  "confidence": "high" | "medium" | "low",
  "shouldEscalate": boolean,
  "suggestedQuestions": string[],
  "citationSourceIds": string[]
}`,
    user: [
      `QUESTION: ${question}`,
      ``,
      `RETRIEVED_SOURCES_JSON:`,
      JSON.stringify(
        matchedChunks.map((chunk) => ({
          sourceId: chunk.sourceId,
          title: chunk.title,
          href: chunk.href,
          heading: chunk.heading,
          content: chunk.content,
        }))
      ),
    ].join("\n"),
    temperature: 0.2,
    maxTokens: 1200,
  });

  const data = raw as {
    answer?: string;
    confidence?: "high" | "medium" | "low";
    shouldEscalate?: boolean;
    suggestedQuestions?: string[];
    citationSourceIds?: string[];
  };

  const sourceIds = new Set(matchedChunks.map((chunk) => chunk.sourceId));
  const citations = (data.citationSourceIds ?? [])
    .filter((id): id is string => typeof id === "string" && sourceIds.has(id))
    .map((id) => matchedChunks.find((chunk) => chunk.sourceId === id))
    .filter((chunk): chunk is NonNullable<typeof chunk> => Boolean(chunk))
    .map((chunk) => ({
      sourceId: chunk.sourceId,
      title: chunk.title,
      href: chunk.href,
      heading: chunk.heading,
    }));

  const answer: AssistantAnswer = {
    answer: data.answer?.trim() || fallbackAnswer(question).answer,
    confidence: data.confidence ?? "low",
    shouldEscalate: Boolean(data.shouldEscalate),
    suggestedQuestions: Array.isArray(data.suggestedQuestions)
      ? data.suggestedQuestions.filter((q): q is string => typeof q === "string").slice(0, 4)
      : [],
    citations: citations.length > 0 ? citations : fallbackAnswer(question).citations,
  };

  return { answer, matchedChunks };
}
