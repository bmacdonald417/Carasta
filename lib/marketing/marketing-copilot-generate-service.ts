import { prisma } from "@/lib/db";
import { MARKETING_COPILOT_SYSTEM_PROMPT } from "@/lib/marketing/marketing-copilot-prompt";
import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
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
  reservePriceCents: number | null;
  seller: { handle: string; name: string | null };
};

async function loadListingContext(auctionId: string, sellerId: string): Promise<ListingContextForCopilot | null> {
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
      reservePriceCents: true,
      seller: { select: { handle: true, name: true } },
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
    reservePriceCents: row.reservePriceCents,
    seller: row.seller,
  };
}

function buildUserPrompt(input: {
  listing: ListingContextForCopilot;
  intake: MarketingCopilotGenerateBody;
}): string {
  const schemaHint = `Respond with a single JSON object exactly in this shape:
{
  "plan": {
    "objective": string,
    "audience": string,
    "positioning": string,
    "channels": string[],
    "summaryStrategy": string
  },
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
  }>
}

Constraints:
- Include at least 5 tasks and at least 4 artifacts when reasonable for the selected channels.
- Map each selected channel to at least one task or artifact where practical; use "channel" on tasks/artifacts as a short slug matching the channel key (e.g. "instagram", "carmunity").
- For artifacts, use type CAPTION for social captions, HEADLINE for short hooks, BODY for longer forum/email drafts, HASHTAGS for hashtag/CTA lines, OTHER for misc.
- "plan.channels" should list the same logical channels the seller selected (use their keys: carmunity, facebook, instagram, x, google, forums, email).
- Do not claim reserve is met or not unless reserve is explicitly provided in listing context (reservePriceCents may be null).`;

  return [
    schemaHint,
    "",
    "LISTING_CONTEXT_JSON:",
    JSON.stringify(input.listing),
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
    }),
  ].join("\n");
}

export async function generateMarketingCopilotStructured(params: {
  auctionId: string;
  sellerId: string;
  intake: MarketingCopilotGenerateBody;
}): Promise<{ listing: ListingContextForCopilot; result: MarketingCopilotStructuredResult }> {
  const listing = await loadListingContext(params.auctionId, params.sellerId);
  if (!listing) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const raw = await openAiChatJsonObject({
    system: MARKETING_COPILOT_SYSTEM_PROMPT,
    user: buildUserPrompt({ listing, intake: params.intake }),
  });

  const parsed = marketingCopilotStructuredResultSchema.safeParse(raw);
  if (!parsed.success) {
    const err = new Error("MODEL_OUTPUT_INVALID");
    (err as Error & { zodError?: unknown }).zodError = parsed.error.flatten();
    throw err;
  }

  return { listing, result: parsed.data };
}
