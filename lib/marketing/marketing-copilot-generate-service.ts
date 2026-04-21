import { prisma } from "@/lib/db";
import { MARKETING_COPILOT_SYSTEM_PROMPT } from "@/lib/marketing/marketing-copilot-prompt";
import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import type { CopilotLightMetrics } from "@/lib/marketing/marketing-copilot-analytics-context";
import { sanitizeCopilotStructuredResult } from "@/lib/marketing/marketing-copilot-sanitize";
import { deriveListingReadinessSnapshot } from "@/lib/listing-ai/listing-ai-readiness";
import {
  marketingCopilotStructuredResultSchema,
  type MarketingCopilotGenerateBody,
  type MarketingCopilotStructuredResult,
} from "@/lib/validations/marketing-copilot";

export type ListingContextForCopilot = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  status: string;
  endAt: string;
  description: string | null;
  conditionSummary: string | null;
  conditionGrade: string | null;
  reservePriceCents: number | null;
  seller: { handle: string; name: string | null };
  existingWorkspacePlan: {
    objective: string;
    audience: string;
    positioning: string;
    channels: unknown;
  } | null;
};

export async function loadListingContext(
  auctionId: string,
  sellerId: string
): Promise<ListingContextForCopilot | null> {
  const row = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: {
      id: true,
      title: true,
      year: true,
      make: true,
      model: true,
      trim: true,
      mileage: true,
      status: true,
      endAt: true,
      description: true,
      conditionSummary: true,
      conditionGrade: true,
      reservePriceCents: true,
      seller: { select: { handle: true, name: true } },
      listingMarketingPlan: {
        select: {
          objective: true,
          audience: true,
          positioning: true,
          channels: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    mileage: row.mileage,
    status: row.status,
    endAt: row.endAt.toISOString(),
    description: row.description,
    conditionSummary: row.conditionSummary,
    conditionGrade: row.conditionGrade ? String(row.conditionGrade) : null,
    reservePriceCents: row.reservePriceCents,
    seller: row.seller,
    existingWorkspacePlan: row.listingMarketingPlan
      ? {
          objective: row.listingMarketingPlan.objective,
          audience: row.listingMarketingPlan.audience,
          positioning: row.listingMarketingPlan.positioning,
          channels: row.listingMarketingPlan.channels,
        }
      : null,
  };
}

function inferWorkflowMode(
  intake: MarketingCopilotGenerateBody,
  metrics: CopilotLightMetrics | null
): MarketingCopilotGenerateBody["workflowMode"] {
  if (intake.workflowMode && intake.workflowMode !== "launch") {
    return intake.workflowMode;
  }
  if (metrics?.listingStatus === "LIVE" && metrics.hoursRemaining != null && metrics.hoursRemaining <= 36) {
    return "ending_soon_push";
  }
  if ((metrics?.totalViewEvents ?? 0) < 20 && (metrics?.totalBidClicks ?? 0) === 0) {
    return "low_traction_recovery";
  }
  return intake.workflowMode ?? "launch";
}

function buildUserPrompt(input: {
  listing: ListingContextForCopilot;
  intake: MarketingCopilotGenerateBody;
  metrics: CopilotLightMetrics | null;
}): string {
  const readiness = deriveListingReadinessSnapshot({
    description: input.listing.description,
    conditionSummary: input.listing.conditionSummary,
    mileage: input.listing.mileage,
    conditionGrade: input.listing.conditionGrade,
  });
  const workflowMode = inferWorkflowMode(input.intake, input.metrics);
  const schemaHint = `Respond with a single JSON object exactly in this shape:
{
  "plan": {
    "objective": string,
    "audience": string,
    "positioning": string,
    "channels": string[],
    "summaryStrategy": string,
    "whyNow": string,
    "workflowMode": "launch" | "low_traction_recovery" | "ending_soon_push" | "channel_expansion" | "content_refresh"
  },
  "priorityActions": Array<{
    "title": string,
    "actionNow": string,
    "whyThisMatters": string,
    "channel"?: string | null,
    "tone"?: "info" | "success" | "caution" | "urgency"
  }>,
  "channelPlaybooks": Array<{
    "channel": "carmunity" | "facebook" | "instagram" | "x" | "google" | "forums" | "email",
    "audienceFit": string,
    "whyThisChannel": string,
    "cadence": string,
    "messagingAngle": string,
    "ctaGuidance": string,
    "assetSuggestions": string[],
    "doNotes": string[],
    "avoidNotes": string[]
  }>,
  "tasks": Array<{
    "title": string,
    "description"?: string,
    "channel"?: string | null,
    "type"?: "CHECKLIST" | "REMINDER" | "MILESTONE" | "CUSTOM"
  }>,
  "artifacts": Array<{
    "type": "CAPTION" | "HEADLINE" | "BODY" | "HASHTAGS" | "OTHER",
    "channel": string,
    "content": string
  }>,
  "watchouts": Array<{
    "title": string,
    "detail": string
  }>,
  "measurementPlan": Array<{
    "metric": string,
    "whyThisMatters": string,
    "targetSignal"?: string
  }>
}

Constraints:
- Include at least 5 tasks and at least 4 artifacts when reasonable for the selected channels.
- Include at least 2 priorityActions when reasonable.
- Include one channelPlaybook per selected channel when reasonable.
- Map each selected channel to at least one task or artifact where practical; use "channel" on tasks/artifacts as a short slug matching the channel key (e.g. "instagram", "carmunity").
- For artifacts, use type CAPTION for social captions, HEADLINE for short hooks, BODY for longer forum/email drafts, HASHTAGS for hashtag/CTA lines, OTHER for misc.
- "plan.channels" should list the same logical channels the seller selected (use their keys: carmunity, facebook, instagram, x, google, forums, email).
- Do not claim reserve is met or not unless reserve is explicitly provided in listing context (reservePriceCents may be null).
- LIGHT_METRICS_JSON is for tone and cadence suggestions only — never promise performance based on these numbers.`;

  return [
    schemaHint,
    "",
    "LISTING_CONTEXT_JSON:",
    JSON.stringify(input.listing),
    "",
    "LISTING_READINESS_JSON:",
    JSON.stringify(readiness),
    "",
    "LIGHT_METRICS_JSON:",
    JSON.stringify(input.metrics ?? {}),
    "",
    "INFERRED_WORKFLOW_MODE:",
    workflowMode,
    "",
    "SELLER_INTAKE_JSON:",
    JSON.stringify({
      objectiveGoal: input.intake.objectiveGoal,
      audience: input.intake.audience,
      positioning: input.intake.positioning,
      channels: input.intake.channels,
      tone: input.intake.tone,
      budgetLevel: input.intake.budgetLevel,
      urgency: input.intake.urgency,
      listingHighlights: input.intake.listingHighlights,
      workflowMode: workflowMode,
      previousStrategySummary:
        input.intake.previousStrategySummary ||
        input.listing.existingWorkspacePlan?.positioning ||
        "",
    }),
  ].join("\n");
}

export async function generateMarketingCopilotStructured(params: {
  auctionId: string;
  sellerId: string;
  intake: MarketingCopilotGenerateBody;
  metrics: CopilotLightMetrics | null;
}): Promise<{ listing: ListingContextForCopilot; result: MarketingCopilotStructuredResult }> {
  const listing = await loadListingContext(params.auctionId, params.sellerId);
  if (!listing) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const raw = await openAiChatJsonObject({
    system: MARKETING_COPILOT_SYSTEM_PROMPT,
    user: buildUserPrompt({ listing, intake: params.intake, metrics: params.metrics }),
  });

  const parsed = marketingCopilotStructuredResultSchema.safeParse(raw);
  if (!parsed.success) {
    const err = new Error("MODEL_OUTPUT_INVALID");
    (err as Error & { zodError?: unknown }).zodError = parsed.error.flatten();
    throw err;
  }

  return { listing, result: sanitizeCopilotStructuredResult(parsed.data) };
}
