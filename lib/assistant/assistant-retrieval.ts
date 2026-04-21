import { promises as fs } from "fs";

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
  const queryTokens = tokenize(query);
  const content = normalize([chunk.title, chunk.heading, chunk.content].join(" "));
  let score = 0;

  for (const token of queryTokens) {
    if (content.includes(token)) score += 2;
  }

  const phrase = normalize(query);
  if (phrase && content.includes(phrase)) score += 6;
  if (normalize(chunk.title).includes(phrase)) score += 4;
  if (normalize(chunk.heading).includes(phrase)) score += 3;

  return score;
}

function chunkMarkdown(sourceId: string, title: string, href: string, content: string) {
  const lines = content.split(/\r?\n/);
  const chunks: AssistantChunk[] = [];
  let currentHeading = title;
  let buffer: string[] = [];
  let index = 0;

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
    if (line.trim() === "") {
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
    .map((chunk) => ({ ...chunk, score: scoreChunk(query, chunk) }))
    .filter((chunk) => (chunk.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, take);
}
