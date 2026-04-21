import { assistantSourceRegistry } from "@/lib/assistant/assistant-source-registry";

export type AssistantQuestionIntent =
  | "definition"
  | "community"
  | "workflow"
  | "navigation"
  | "trust"
  | "seller"
  | "account_specific"
  | "general";

const synonymMap: Array<[RegExp, string]> = [
  [/\bforums?\b/gi, "discussions"],
  [/\bthreads?\b/gi, "discussions"],
  [/\bdms?\b/gi, "messages"],
  [/\bdirect messages?\b/gi, "messages"],
  [/\binbox\b/gi, "messages"],
  [/\bchat\b/gi, "messages"],
  [/\bmy cars?\b/gi, "garage"],
  [/\bsaved auctions?\b/gi, "auction watchlist"],
  [/\bwatchlist\b/gi, "auction watchlist"],
  [/\bsettings\b/gi, "settings"],
  [/\bnotifications?\b/gi, "notifications"],
  [/\bhelp desk\b/gi, "contact"],
  [/\bsell tools?\b/gi, "seller tools"],
  [/\bmarketing dashboard\b/gi, "seller workspace"],
];

export function normalizeAssistantQuestion(question: string) {
  let normalized = question.toLowerCase();
  for (const [pattern, replacement] of synonymMap) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\s+/g, " ").trim();
}

export function classifyAssistantQuestion(question: string): AssistantQuestionIntent {
  const normalized = normalizeAssistantQuestion(question);

  if (
    /\b(my|account|balance|dispute|refund|approved|status of my|my bid|my listing|my message|my conversation)\b/.test(
      normalized
    )
  ) {
    return "account_specific";
  }

  if (/\b(legal|policy|privacy|terms|guidelines|safe|trust|moderation)\b/.test(normalized)) {
    return "trust";
  }

  if (/\b(seller|workspace|marketing|copilot|listing ai|campaign)\b/.test(normalized)) {
    return "seller";
  }

  if (/\b(carmunity|discussions|messages|forum|forums|garage|profile)\b/.test(normalized)) {
    return "community";
  }

  if (/\b(where|how do i find|where do i go|how do i get to)\b/.test(normalized)) {
    return "navigation";
  }

  if (/\b(what is|what does|define|mean)\b/.test(normalized)) {
    return "definition";
  }

  if (/\b(how|workflow|process|bid|buy|sell|auction)\b/.test(normalized)) {
    return "workflow";
  }

  return "general";
}

export function preferredSourceIdsForIntent(intent: AssistantQuestionIntent) {
  switch (intent) {
    case "definition":
      return ["faq-and-glossary", "platform-overview", "community-and-conversation"];
    case "workflow":
      return ["auctions-buying-and-selling", "platform-overview", "seller-workspace-and-ai"];
    case "community":
      return [
        "using-discussions-and-messages",
        "community-and-conversation",
        "how-surfaces-fit-together",
        "identity-and-garage",
        "faq-and-glossary",
      ];
    case "navigation":
      return [
        "navigation-and-help-paths",
        "help-routing",
        "common-support-situations",
        "trust-safety-and-help",
        "faq-and-glossary",
      ];
    case "trust":
      return [
        "trust-safety-and-help",
        "navigation-and-help-paths",
        "help-routing",
        "common-support-situations",
        "faq-and-glossary",
      ];
    case "seller":
      return [
        "seller-workspace-and-ai",
        "navigation-and-help-paths",
        "common-support-situations",
        "auctions-buying-and-selling",
      ];
    case "account_specific":
      return ["common-support-situations", "help-routing", "trust-safety-and-help", "faq-and-glossary"];
    default:
      return assistantSourceRegistry.map((source) => source.id);
  }
}
