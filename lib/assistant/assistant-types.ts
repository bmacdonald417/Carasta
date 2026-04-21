export type AssistantSourceDoc = {
  id: string;
  title: string;
  filePath: string;
  href: string;
  summary: string;
};

export type AssistantChunk = {
  chunkId: string;
  sourceId: string;
  title: string;
  href: string;
  heading: string;
  content: string;
  score?: number;
};

export type AssistantAnswer = {
  answer: string;
  confidence: "high" | "medium" | "low";
  shouldEscalate: boolean;
  suggestedQuestions: string[];
  citations: Array<{
    sourceId: string;
    title: string;
    href: string;
    heading?: string;
  }>;
};
