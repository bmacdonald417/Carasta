import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMarketingCopilotConfigured } from "@/lib/marketing/marketing-copilot-openai";
import { isListingAiEnabled } from "@/lib/listing-ai/listing-ai-feature-flag";
import { assertListingAiAllowed } from "@/lib/listing-ai/listing-ai-rate-limit";
import { rewriteListingField } from "@/lib/listing-ai/listing-ai-rewrite-field-service";
import { createListingAiRun } from "@/lib/listing-ai/listing-ai-run-service";
import { getListingAiModel } from "@/lib/listing-ai/listing-ai-model";
import { listingAiRewriteFieldSchema } from "@/lib/validations/listing-ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/listings/ai/rewrite-field
 * Small, single-field listing copy improvements (counts toward listing AI rate limits).
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

  const parsed = listingAiRewriteFieldSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const body = parsed.data;
  let auctionId: string | null = null;
  let workBody = { ...body };

  if (body.auctionId) {
    const owned = await prisma.auction.findFirst({
      where: { id: body.auctionId, sellerId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        conditionSummary: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        mileage: true,
        vin: true,
        conditionGrade: true,
      },
    });
    if (!owned) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }
    auctionId = owned.id;
    workBody.year = owned.year;
    workBody.make = owned.make;
    workBody.model = owned.model;
    workBody.trim = owned.trim;
    workBody.mileage = owned.mileage;
    workBody.vin = owned.vin ?? undefined;
    workBody.title = owned.title;
    workBody.description = owned.description ?? undefined;
    workBody.conditionSummary = owned.conditionSummary ?? undefined;
    workBody.conditionGrade = owned.conditionGrade
      ? String(owned.conditionGrade)
      : undefined;
  }

  const currentValue =
    workBody.field === "title"
      ? workBody.title ?? ""
      : workBody.field === "description"
        ? workBody.description ?? ""
        : workBody.conditionSummary ?? "";

  const rl = await assertListingAiAllowed(userId);
  if (!rl.ok) {
    return NextResponse.json({ message: rl.message }, { status: rl.status });
  }

  try {
    const text = await rewriteListingField({ body: workBody, currentValue });
    const model = getListingAiModel();
    const run = await createListingAiRun({
      createdById: userId,
      auctionId,
      intake: { _runKind: "FIELD_REWRITE" as const, ...workBody },
      output: { text },
      model,
    });

    return NextResponse.json({ runId: run.id, text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Rewrite failed.";
    return NextResponse.json({ message: msg }, { status: 502 });
  }
}
