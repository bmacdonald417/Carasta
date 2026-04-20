import { NextResponse } from "next/server";
import {
  assertAuctionOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { isMarketingCopilotConfigured, getMarketingCopilotModel } from "@/lib/marketing/marketing-copilot-openai";
import { loadCopilotLightMetrics } from "@/lib/marketing/marketing-copilot-analytics-context";
import { assertCopilotOpenAiAllowed } from "@/lib/marketing/marketing-copilot-rate-limit";
import { createMarketingCopilotRun } from "@/lib/marketing/marketing-copilot-run-service";
import { regenerateCopilotArtifact } from "@/lib/marketing/marketing-copilot-regenerate-service";
import { marketingCopilotRegenerateArtifactBodySchema } from "@/lib/validations/marketing-copilot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  if (!isMarketingCopilotConfigured()) {
    return NextResponse.json({ message: "AI copilot is not configured." }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = marketingCopilotRegenerateArtifactBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { auctionId, intake, artifact } = parsed.data;
  const owned = await assertAuctionOwnedBySeller(auctionId, auth.user.id);
  if (!owned) return NextResponse.json({ message: "Listing not found." }, { status: 404 });

  const rl = await assertCopilotOpenAiAllowed(auth.user.id);
  if (!rl.ok) {
    return NextResponse.json({ message: rl.message }, { status: rl.status });
  }

  try {
    const metrics = await loadCopilotLightMetrics(auctionId, auth.user.id);
    const next = await regenerateCopilotArtifact({
      auctionId,
      sellerId: auth.user.id,
      intake,
      metrics,
      current: artifact,
    });

    const run = await createMarketingCopilotRun({
      auctionId,
      createdById: auth.user.id,
      intake: { _runKind: "REGEN_ARTIFACT", intake, artifact },
      output: { artifact: next },
      model: getMarketingCopilotModel(),
    });

    return NextResponse.json({ runId: run.id, artifact: next });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "REGEN_FAILED";
    if (msg === "LISTING_NOT_FOUND") {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }
    if (msg === "MODEL_OUTPUT_INVALID") {
      return NextResponse.json({ message: "Invalid model output." }, { status: 422 });
    }
    console.error("[marketing/copilot/regenerate-artifact]", e);
    return NextResponse.json({ message: "Regeneration failed." }, { status: 502 });
  }
}
