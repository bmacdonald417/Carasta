import { NextResponse } from "next/server";
import {
  assertAuctionOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { isMarketingCopilotConfigured, getMarketingCopilotModel } from "@/lib/marketing/marketing-copilot-openai";
import { generateMarketingCopilotStructured } from "@/lib/marketing/marketing-copilot-generate-service";
import { loadCopilotLightMetrics } from "@/lib/marketing/marketing-copilot-analytics-context";
import { assertCopilotOpenAiAllowed } from "@/lib/marketing/marketing-copilot-rate-limit";
import { createMarketingCopilotRun } from "@/lib/marketing/marketing-copilot-run-service";
import { marketingCopilotGenerateBodySchema } from "@/lib/validations/marketing-copilot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/marketing/copilot/generate
 * Persists an auditable MarketingCopilotRun; returns structured draft for review (not workspace apply).
 */
export async function POST(req: Request) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  if (!isMarketingCopilotConfigured()) {
    return NextResponse.json(
      {
        message:
          "AI copilot is not configured. Set OPENAI_API_KEY (and optionally MARKETING_COPILOT_MODEL).",
      },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = marketingCopilotGenerateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const body = parsed.data;
  const owned = await assertAuctionOwnedBySeller(body.auctionId, auth.user.id);
  if (!owned) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const rl = await assertCopilotOpenAiAllowed(auth.user.id);
  if (!rl.ok) {
    return NextResponse.json({ message: rl.message }, { status: rl.status });
  }

  try {
    const metrics = await loadCopilotLightMetrics(body.auctionId, auth.user.id);
    const { listing, result } = await generateMarketingCopilotStructured({
      auctionId: body.auctionId,
      sellerId: auth.user.id,
      intake: body,
      metrics,
    });

    const run = await createMarketingCopilotRun({
      auctionId: body.auctionId,
      createdById: auth.user.id,
      intake: { _runKind: "GENERATE", ...body },
      output: result,
      model: getMarketingCopilotModel(),
    });

    return NextResponse.json({
      runId: run.id,
      listing: {
        id: listing.id,
        title: listing.title,
        year: listing.year,
        make: listing.make,
        model: listing.model,
        trim: listing.trim,
        mileage: listing.mileage,
        status: listing.status,
      },
      copilot: result,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "GENERATION_FAILED";
    if (msg === "LISTING_NOT_FOUND") {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }
    if (msg === "MODEL_OUTPUT_INVALID") {
      return NextResponse.json(
        { message: "The model returned an invalid structure. Try again with simpler inputs." },
        { status: 422 }
      );
    }
    console.error("[marketing/copilot/generate]", e);
    return NextResponse.json(
      { message: msg === "GENERATION_FAILED" ? "Generation failed." : msg },
      { status: 502 }
    );
  }
}
