import { z } from "zod";
import { ListingMarketingArtifactType, ListingMarketingTaskType } from "@prisma/client";

/** Canonical channel keys the copilot understands. */
export const MARKETING_COPILOT_CHANNEL_KEYS = [
  "carmunity",
  "facebook",
  "instagram",
  "x",
  "google",
  "forums",
  "email",
] as const;

export type MarketingCopilotChannelKey = (typeof MARKETING_COPILOT_CHANNEL_KEYS)[number];

export const marketingCopilotChannelKeySchema = z.enum(MARKETING_COPILOT_CHANNEL_KEYS);

export const marketingCopilotGenerateBodySchema = z.object({
  auctionId: z.string().min(1),
  /** Primary goal label (free text ok). */
  objectiveGoal: z.string().min(1).max(200),
  audience: z.string().max(20_000).optional().default(""),
  positioning: z.string().max(20_000).optional().default(""),
  channels: z.array(marketingCopilotChannelKeySchema).min(1).max(16),
  tone: z.string().max(200).optional().default(""),
  budgetLevel: z.string().max(120).optional().default(""),
  urgency: z.string().max(120).optional().default(""),
  /** Seller-supplied differentiators; never required to duplicate title/make/model. */
  listingHighlights: z.string().max(20_000).optional().default(""),
});

export const marketingCopilotPlanBlockSchema = z.object({
  objective: z.string().max(20_000),
  audience: z.string().max(20_000),
  positioning: z.string().max(20_000),
  channels: z.array(z.string().min(1).max(64)).max(32),
  summaryStrategy: z.string().max(20_000),
});

export type MarketingCopilotPlanBlock = z.infer<typeof marketingCopilotPlanBlockSchema>;

export const marketingCopilotTaskBlockSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(20_000).optional().default(""),
  channel: z.string().max(64).nullable().optional(),
  type: z.nativeEnum(ListingMarketingTaskType).optional().default(ListingMarketingTaskType.CHECKLIST),
});

export const marketingCopilotArtifactBlockSchema = z.object({
  type: z.nativeEnum(ListingMarketingArtifactType),
  channel: z.string().max(64).optional().default(""),
  content: z.string().min(1).max(100_000),
});

export const marketingCopilotStructuredResultSchema = z.object({
  plan: marketingCopilotPlanBlockSchema,
  tasks: z.array(marketingCopilotTaskBlockSchema).min(1).max(28),
  artifacts: z.array(marketingCopilotArtifactBlockSchema).min(1).max(36),
});

export const marketingCopilotApplyBodySchema = z.object({
  auctionId: z.string().min(1),
  /** Client-reviewed structured output from generate (re-validated server-side). */
  copilot: marketingCopilotStructuredResultSchema,
});

export type MarketingCopilotStructuredResult = z.infer<typeof marketingCopilotStructuredResultSchema>;
export type MarketingCopilotGenerateBody = z.infer<typeof marketingCopilotGenerateBodySchema>;
