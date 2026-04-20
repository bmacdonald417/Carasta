import { z } from "zod";
import { MARKETING_COPILOT_SYSTEM_PROMPT } from "@/lib/marketing/marketing-copilot-prompt";
import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import {
  loadListingContext,
  type ListingContextForCopilot,
} from "@/lib/marketing/marketing-copilot-generate-service";
import type { CopilotLightMetrics } from "@/lib/marketing/marketing-copilot-analytics-context";
import { sanitizeArtifactBlock, sanitizeTaskBlock } from "@/lib/marketing/marketing-copilot-sanitize";
import {
  marketingCopilotArtifactBlockSchema,
  marketingCopilotTaskBlockSchema,
  type MarketingCopilotArtifactBlock,
  type MarketingCopilotGenerateBody,
  type MarketingCopilotTaskBlock,
} from "@/lib/validations/marketing-copilot";

const singleTaskSchema = z.object({ task: marketingCopilotTaskBlockSchema });
const singleArtifactSchema = z.object({ artifact: marketingCopilotArtifactBlockSchema });

function buildRegenUserPrompt(params: {
  listing: ListingContextForCopilot;
  intake: MarketingCopilotGenerateBody;
  metrics: CopilotLightMetrics | null;
  focus: string;
}): string {
  return [
    "Return a single JSON object with exactly one key: either {\"task\": {...}} OR {\"artifact\": {...}} matching the requested focus.",
    "Do not include markdown fences.",
    "",
    "FOCUS:",
    params.focus,
    "",
    "LISTING_CONTEXT_JSON:",
    JSON.stringify(params.listing),
    "",
    "LIGHT_METRICS_JSON:",
    JSON.stringify(params.metrics ?? {}),
    "",
    "SELLER_INTAKE_JSON:",
    JSON.stringify({
      objectiveGoal: params.intake.objectiveGoal,
      audience: params.intake.audience,
      positioning: params.intake.positioning,
      channels: params.intake.channels,
      tone: params.intake.tone,
      budgetLevel: params.intake.budgetLevel,
      urgency: params.intake.urgency,
      listingHighlights: params.intake.listingHighlights,
    }),
  ].join("\n");
}

export async function regenerateCopilotTask(params: {
  auctionId: string;
  sellerId: string;
  intake: MarketingCopilotGenerateBody;
  metrics: CopilotLightMetrics | null;
  current: MarketingCopilotTaskBlock;
}): Promise<MarketingCopilotTaskBlock> {
  const listing = await loadListingContext(params.auctionId, params.sellerId);
  if (!listing) throw new Error("LISTING_NOT_FOUND");

  const focus = [
    "Regenerate ONE checklist task JSON object under key \"task\".",
    "Current task JSON:",
    JSON.stringify(params.current),
    "Keep channel alignment and avoid inventing listing facts.",
  ].join("\n");

  const raw = await openAiChatJsonObject({
    system: `${MARKETING_COPILOT_SYSTEM_PROMPT}\nYou only output JSON with shape {\"task\": {...}}.`,
    user: buildRegenUserPrompt({
      listing,
      intake: params.intake,
      metrics: params.metrics,
      focus,
    }),
  });

  const parsed = singleTaskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("MODEL_OUTPUT_INVALID");
  }
  return sanitizeTaskBlock(parsed.data.task);
}

export async function regenerateCopilotArtifact(params: {
  auctionId: string;
  sellerId: string;
  intake: MarketingCopilotGenerateBody;
  metrics: CopilotLightMetrics | null;
  current: MarketingCopilotArtifactBlock;
}): Promise<MarketingCopilotArtifactBlock> {
  const listing = await loadListingContext(params.auctionId, params.sellerId);
  if (!listing) throw new Error("LISTING_NOT_FOUND");

  const focus = [
    "Regenerate ONE marketing artifact JSON object under key \"artifact\".",
    "Current artifact JSON:",
    JSON.stringify(params.current),
    "Preserve listing truth; avoid guarantees; keep channel-appropriate format.",
  ].join("\n");

  const raw = await openAiChatJsonObject({
    system: `${MARKETING_COPILOT_SYSTEM_PROMPT}\nYou only output JSON with shape {\"artifact\": {...}}.`,
    user: buildRegenUserPrompt({
      listing,
      intake: params.intake,
      metrics: params.metrics,
      focus,
    }),
  });

  const parsed = singleArtifactSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("MODEL_OUTPUT_INVALID");
  }
  return sanitizeArtifactBlock(parsed.data.artifact);
}
