/**
 * Phase 2X — deterministic bridge from Assistant outputs → Quick help palette.
 * Uses canonical hrefs already present on citations / recommendedRoutes (no server registry in the client).
 */

import type { AssistantAnswer } from "@/lib/assistant/assistant-types";
import { findCanonicalHelpTopicByHref } from "@/lib/help/help-retrieval";

export const ASSISTANT_PALETTE_BRIDGE_VERSION = "2x.1";

function dedupeStrings(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * Collect stable palette `topicId` values for highlighting rows that match assistant citations and routes.
 */
export function collectAssistantPaletteTopicIds(
  reply: Pick<AssistantAnswer, "citations" | "recommendedRoutes">
): string[] {
  const topicIds: string[] = [];
  for (const citation of reply.citations ?? []) {
    const link = findCanonicalHelpTopicByHref(citation.href);
    if (link) topicIds.push(link.topicId);
  }
  for (const route of reply.recommendedRoutes ?? []) {
    const link = findCanonicalHelpTopicByHref(route.href);
    if (link) topicIds.push(link.topicId);
  }
  return dedupeStrings(topicIds);
}
