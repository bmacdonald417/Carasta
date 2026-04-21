import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import {
  classifyAssistantQuestion,
  normalizeAssistantQuestion,
  preferredSourceIdsForIntent,
} from "@/lib/assistant/assistant-query-analysis";
import { retrieveAssistantChunks } from "@/lib/assistant/assistant-retrieval";
import { assistantSourceRegistry } from "@/lib/assistant/assistant-source-registry";
import type { AssistantAnswer } from "@/lib/assistant/assistant-types";

function pickFallbackSource(question: string) {
  const intent = classifyAssistantQuestion(question);
  const preferred = preferredSourceIdsForIntent(intent);
  return (
    preferred
      .map((id) => assistantSourceRegistry.find((source) => source.id === id))
      .find(Boolean) ?? assistantSourceRegistry.find((source) => source.id === "platform-overview")
  );
}

function fallbackAnswer(question: string, reason = "low_retrieval"): AssistantAnswer {
  const intent = classifyAssistantQuestion(question);
  const source = pickFallbackSource(question);
  const answer =
    intent === "account_specific"
      ? "I can help explain Carasta at a general level, but I can’t confirm account-specific state, balances, approvals, disputes, or other private user details from this assistant. The best next step is to check the relevant product surface directly or contact Carasta if you need support."
      : "I’m not confident enough to answer that from the current Carasta knowledge set. The best next step is to open the closest help page or contact Carasta directly if you need support beyond general product guidance.";

  return {
    answer,
    confidence: "low",
    shouldEscalate: true,
    fallbackReason: reason,
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

function assessRetrievalConfidence(
  question: string,
  matchedChunks: Awaited<ReturnType<typeof retrieveAssistantChunks>>
) {
  const normalized = normalizeAssistantQuestion(question);
  const top = matchedChunks[0]?.score ?? 0;
  const topTwoSourceIds = new Set(matchedChunks.slice(0, 2).map((chunk) => chunk.sourceId));
  const tokenCount = normalized.split(" ").filter(Boolean).length;
  const exactishMatch =
    matchedChunks[0]?.heading &&
    normalizeAssistantQuestion(matchedChunks[0].heading).includes(normalized);
  const intent = classifyAssistantQuestion(question);
  const preferred = new Set(preferredSourceIdsForIntent(intent));
  const topSourceIsPreferred = matchedChunks[0] ? preferred.has(matchedChunks[0].sourceId) : false;

  if (intent === "account_specific") {
    return { confidence: "low" as const, fallbackReason: "account_specific_scope" };
  }

  if (top < 5) {
    return { confidence: "low" as const, fallbackReason: "weak_retrieval_score" };
  }

  if (
    tokenCount > 4 &&
    topTwoSourceIds.size === 1 &&
    !exactishMatch &&
    !(
      topSourceIsPreferred &&
      ((intent === "trust" && top >= 20) ||
        (intent === "community" && top >= 18) ||
        top >= 24)
    )
  ) {
    return { confidence: "medium" as const, fallbackReason: "narrow_source_coverage" };
  }

  return { confidence: "high" as const, fallbackReason: null };
}

export async function answerCarastaAssistantQuestion(
  question: string
): Promise<{
  answer: AssistantAnswer;
  matchedChunks: Awaited<ReturnType<typeof retrieveAssistantChunks>>;
}> {
  const matchedChunks = await retrieveAssistantChunks(question, 6);
  if (matchedChunks.length === 0) {
    return { answer: fallbackAnswer(question, "no_relevant_sources"), matchedChunks };
  }

  const retrievalAssessment = assessRetrievalConfidence(question, matchedChunks);
  if (retrievalAssessment.confidence === "low") {
    return {
      answer: fallbackAnswer(
        question,
        retrievalAssessment.fallbackReason ?? "low_retrieval_confidence"
      ),
      matchedChunks,
    };
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
    fallbackReason?: string;
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
      category:
        assistantSourceRegistry.find((source) => source.id === chunk.sourceId)?.category,
    }));

  const baselineFallback = fallbackAnswer(
    question,
    retrievalAssessment.fallbackReason ?? "model_answer_incomplete"
  );
  const answer: AssistantAnswer = {
    answer: data.answer?.trim() || baselineFallback.answer,
    confidence:
      retrievalAssessment.confidence === "medium"
        ? data.confidence === "high"
          ? "medium"
          : data.confidence ?? "medium"
        : data.confidence ?? "low",
    shouldEscalate:
      Boolean(data.shouldEscalate) || retrievalAssessment.confidence !== "high",
    fallbackReason:
      data.fallbackReason ??
      (retrievalAssessment.confidence === "high"
        ? undefined
        : retrievalAssessment.fallbackReason ?? undefined),
    suggestedQuestions: Array.isArray(data.suggestedQuestions)
      ? data.suggestedQuestions.filter((q): q is string => typeof q === "string").slice(0, 4)
      : [],
    citations: citations.length > 0 ? citations : baselineFallback.citations,
  };

  return { answer, matchedChunks };
}
