import { promises as fs } from "fs";

import { normalizeAssistantQuestion, preferredSourceIdsForIntent, classifyAssistantQuestion } from "@/lib/assistant/assistant-query-analysis";
import { assistantSourceRegistry } from "@/lib/assistant/assistant-source-registry";
import type { AssistantChunk } from "@/lib/assistant/assistant-types";

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 2);
}

function scoreChunk(query: string, chunk: AssistantChunk) {
  const intent = classifyAssistantQuestion(query);
  const preferredIds = new Set(preferredSourceIdsForIntent(intent));
  const queryTokens = tokenize(normalizeAssistantQuestion(query));
  const source = assistantSourceRegistry.find((item) => item.id === chunk.sourceId);
  const title = normalize(chunk.title);
  const heading = normalize(chunk.heading);
  const summary = normalize(source?.summary ?? "");
  const tags = normalize([...(source?.tags ?? []), ...(source?.aliases ?? [])].join(" "));
  const content = normalize([chunk.title, chunk.heading, chunk.content, source?.summary ?? ""].join(" "));
  let score = 0;
  const matchedTerms: string[] = [];

  for (const token of queryTokens) {
    if (content.includes(token)) {
      score += 1;
      matchedTerms.push(token);
    }
    if (title.includes(token)) score += 4;
    if (heading.includes(token)) score += 3;
    if (summary.includes(token)) score += 3;
    if (tags.includes(token)) score += 5;
  }

  const phrase = normalizeAssistantQuestion(query);
  if (phrase && content.includes(phrase)) score += 8;
  if (phrase && title.includes(phrase)) score += 6;
  if (phrase && heading.includes(phrase)) score += 5;
  if (phrase && summary.includes(phrase)) score += 5;
  if (phrase && tags.includes(phrase)) score += 6;

  if (preferredIds.has(chunk.sourceId)) score += 2;
  if (intent === "definition" && source?.category === "faq") score += 2;
  if (intent === "trust" && source?.category === "trust") score += 3;
  if (intent === "seller" && source?.category === "seller") score += 3;
  if (intent === "workflow" && source?.category === "auctions") score += 2;

  return { score, matchedTerms: Array.from(new Set(matchedTerms)) };
}

function chunkMarkdown(sourceId: string, title: string, href: string, content: string) {
  const lines = content.split(/\r?\n/);
  const chunks: AssistantChunk[] = [];
  let currentHeading = title;
  let buffer: string[] = [];
  let index = 0;

  const source = assistantSourceRegistry.find((item) => item.id === sourceId);
  if (source?.summary) {
    chunks.push({
      chunkId: `${sourceId}:summary`,
      sourceId,
      title,
      href,
      heading: `${title} summary`,
      content: source.summary,
    });
  }

  function flush() {
    const body = buffer.join("\n").trim();
    if (!body) return;
    chunks.push({
      chunkId: `${sourceId}:${index++}`,
      sourceId,
      title,
      href,
      heading: currentHeading,
      content: body,
    });
    buffer = [];
  }

  for (const line of lines) {
    if (line.startsWith("#")) {
      flush();
      currentHeading = line.replace(/^#+\s*/, "").trim() || title;
      continue;
    }
    if (line.trim() === "" && buffer.length >= 4) {
      flush();
      continue;
    }
    buffer.push(line);
  }

  flush();
  return chunks;
}

let cachedChunks: AssistantChunk[] | null = null;

export async function loadAssistantChunks(): Promise<AssistantChunk[]> {
  if (cachedChunks) return cachedChunks;

  const docs = await Promise.all(
    assistantSourceRegistry.map(async (source) => {
      const content = await fs.readFile(source.filePath, "utf8");
      return chunkMarkdown(source.id, source.title, source.href, content);
    })
  );

  cachedChunks = docs.flat();
  return cachedChunks;
}

export async function retrieveAssistantChunks(query: string, take = 5) {
  const chunks = await loadAssistantChunks();
  return chunks
    .map((chunk) => {
      const scored = scoreChunk(query, chunk);
      return { ...chunk, score: scored.score, matchedTerms: scored.matchedTerms };
    })
    .filter((chunk) => (chunk.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, take);
}
