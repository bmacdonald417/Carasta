export type AssistantSourceDoc = {
  id: string;
  title: string;
  filePath: string;
  href: string;
  summary: string;
  category:
    | "platform"
    | "community"
    | "identity"
    | "auctions"
    | "seller"
    | "trust"
    | "faq";
  tags: string[];
  aliases?: string[];
};

export type AssistantChunk = {
  chunkId: string;
  sourceId: string;
  title: string;
  href: string;
  heading: string;
  content: string;
  score?: number;
  matchedTerms?: string[];
};

export type AssistantAnswer = {
  answer: string;
  confidence: "high" | "medium" | "low";
  shouldEscalate: boolean;
  fallbackReason?: string;
  suggestedQuestions: string[];
  citations: Array<{
    sourceId: string;
    title: string;
    href: string;
    heading?: string;
    category?: AssistantSourceDoc["category"];
  }>;
};
