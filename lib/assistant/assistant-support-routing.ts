import type { AssistantQuestionIntent } from "@/lib/assistant/assistant-query-analysis";

export function buildAssistantSupportRoutes(params: {
  intent: AssistantQuestionIntent;
  question: string;
  shouldEscalate: boolean;
}) {
  const { intent, shouldEscalate } = params;

  if (!shouldEscalate && intent !== "navigation") {
    return [];
  }

  switch (intent) {
    case "trust":
      return [
        {
          label: "Trust & Safety",
          href: "/resources/trust-and-safety",
          reason: "Best for trust boundaries, safety, and policy-related help.",
        },
        {
          label: "Contact",
          href: "/contact",
          reason: "Use this when self-serve trust guidance is not enough.",
        },
      ];
    case "seller":
      return [
        {
          label: "Selling on Carasta",
          href: "/resources/selling-on-carasta",
          reason: "Best for general seller workflow and tool context.",
        },
        {
          label: "Sell",
          href: "/sell",
          reason: "Best when the next step is listing or entering seller flows.",
        },
      ];
    case "community":
      return [
        {
          label: "Discussions basics",
          href: "/resources/discussions-basics",
          reason: "Best for public thread-based conversation and forum-style questions.",
        },
        {
          label: "What is Carmunity?",
          href: "/resources/what-is-carmunity",
          reason: "Best for understanding the community layer and how it fits into the product.",
        },
      ];
    case "workflow":
      return [
        {
          label: "How It Works",
          href: "/how-it-works",
          reason: "Best for the general platform flow.",
        },
        {
          label: "Auction basics",
          href: "/resources/auction-basics",
          reason: "Best for bidding, reserve, and auction mechanics.",
        },
      ];
    case "account_specific":
      return [
        {
          label: "Contact",
          href: "/contact",
          reason: "Best when the assistant cannot safely verify account-specific state.",
        },
        {
          label: "Resources",
          href: "/resources",
          reason: "Best if you want a general product answer while support handles the account-specific part.",
        },
      ];
    case "navigation":
      return [
        {
          label: "Resources",
          href: "/resources",
          reason: "Best for finding product explanations and key help pages.",
        },
        {
          label: "Contact",
          href: "/contact",
          reason: "Best if navigation and self-serve help still do not solve the issue.",
        },
      ];
    default:
      return [
        {
          label: "Resources",
          href: "/resources",
          reason: "Best starting point for general product questions.",
        },
      ];
  }
}
