import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMarketingCopilotConfigured } from "@/lib/marketing/marketing-copilot-openai";
import { isListingAiEnabled } from "@/lib/listing-ai/listing-ai-feature-flag";
import { assertListingAiAllowed } from "@/lib/listing-ai/listing-ai-rate-limit";
import { generateListingAiCopy } from "@/lib/listing-ai/listing-ai-generate-service";
import { createListingAiRun } from "@/lib/listing-ai/listing-ai-run-service";
import { getListingAiModel } from "@/lib/listing-ai/listing-ai-model";
import { listingAiGenerateBodySchema } from "@/lib/validations/listing-ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/listings/ai/generate
 * Draft listing copy from structured wizard fields (optional saved auction scope).
 */
export async function POST(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!isListingAiEnabled()) {
    return NextResponse.json(
      {
        message:
          "Listing AI is disabled. Set LISTING_AI_ENABLED=true and OPENAI_API_KEY on the server.",
      },
      { status: 503 }
    );
  }

  if (!isMarketingCopilotConfigured()) {
    return NextResponse.json(
      { message: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = listingAiGenerateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const intake = { ...parsed.data };
  let auctionId: string | null = null;
  if (intake.auctionId) {
    const owned = await prisma.auction.findFirst({
      where: { id: intake.auctionId, sellerId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        mileage: true,
        vin: true,
        conditionSummary: true,
      },
    });
    if (!owned) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }
    auctionId = owned.id;
    intake.year = owned.year;
    intake.make = owned.make;
    intake.model = owned.model;
    intake.trim = owned.trim;
    intake.mileage = owned.mileage;
    intake.vin = owned.vin ?? undefined;
    if (!intake.title?.trim()) intake.title = owned.title;
    if (!intake.description?.trim() && owned.description) intake.description = owned.description;
    if (!intake.conditionSummary?.trim() && owned.conditionSummary) {
      intake.conditionSummary = owned.conditionSummary;
    }
  }

  const rl = await assertListingAiAllowed(userId);
  if (!rl.ok) {
    return NextResponse.json({ message: rl.message }, { status: rl.status });
  }

  try {
    const result = await generateListingAiCopy(intake);
    const model = getListingAiModel();
    const run = await createListingAiRun({
      createdById: userId,
      auctionId,
      intake: { ...intake, _runKind: "LISTING_GENERATE" as const },
      output: result,
      model,
    });

    return NextResponse.json({
      runId: run.id,
      listing: result,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed.";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
