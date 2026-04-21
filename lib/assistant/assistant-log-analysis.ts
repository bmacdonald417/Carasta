import {
  classifyAssistantQuestion,
  normalizeAssistantQuestion,
  preferredSourceIdsForIntent,
  type AssistantQuestionIntent,
} from "@/lib/assistant/assistant-query-analysis";

export type AssistantLogAnalysis = {
  normalizedQuestion: string;
  intent: AssistantQuestionIntent;
  topicArea:
    | "platform"
    | "community"
    | "identity"
    | "auctions"
    | "seller"
    | "trust"
    | "support"
    | "account_boundary";
  needsCorpusWork: boolean;
  coverageGap:
    | "account_specific_scope"
    | "weak_retrieval_score"
    | "narrow_source_coverage"
    | "no_relevant_sources"
    | "handled"
    | "other";
  recommendedSourceIds: string[];
};

export function analyzeAssistantQuestionForLog(input: {
  question: string;
  fallbackReason?: string | null;
  confidence: "high" | "medium" | "low";
}) : AssistantLogAnalysis {
  const normalizedQuestion = normalizeAssistantQuestion(input.question);
  const intent = classifyAssistantQuestion(normalizedQuestion);
  const fallbackReason = input.fallbackReason ?? null;

  const coverageGap =
    fallbackReason === "account_specific_scope"
      ? "account_specific_scope"
      : fallbackReason === "weak_retrieval_score"
        ? "weak_retrieval_score"
        : fallbackReason === "narrow_source_coverage"
          ? "narrow_source_coverage"
          : fallbackReason === "no_relevant_sources"
            ? "no_relevant_sources"
            : input.confidence === "high"
              ? "handled"
              : "other";

  return {
    normalizedQuestion,
    intent,
    topicArea:
      intent === "community"
        ? "community"
        : intent === "seller"
          ? "seller"
          : intent === "trust"
            ? "trust"
            : intent === "navigation"
              ? "support"
              : intent === "workflow"
                ? "auctions"
                : intent === "account_specific"
                  ? "account_boundary"
                  : "platform",
    needsCorpusWork:
      coverageGap === "weak_retrieval_score" ||
      coverageGap === "narrow_source_coverage" ||
      coverageGap === "no_relevant_sources",
    coverageGap,
    recommendedSourceIds: preferredSourceIdsForIntent(intent),
  };
}
