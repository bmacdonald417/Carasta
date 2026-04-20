import { NextResponse } from "next/server";
import {
  assertAuctionOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { marketingCopilotApplyBodySchema } from "@/lib/validations/marketing-copilot";
import { applyCopilotToWorkspace } from "@/lib/marketing/marketing-copilot-apply-service";
import { serializeWorkspacePlan } from "@/lib/marketing/listing-marketing-workspace-serialize";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mergePositioningWithSummary(positioning: string, summary: string): string {
  const p = positioning.trim();
  const s = summary.trim();
  if (!s) return p;
  if (!p) return s;
  return `${p}\n\n— Strategy overview —\n\n${s}`;
}

/**
 * POST /api/marketing/copilot/apply
 * Persists reviewed structured output into ListingMarketingPlan / Task / Artifact.
 */
export async function POST(req: Request) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = marketingCopilotApplyBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { auctionId, copilot } = parsed.data;
  const owned = await assertAuctionOwnedBySeller(auctionId, auth.user.id);
  if (!owned) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const copilotForSave = {
    ...copilot,
    plan: {
      ...copilot.plan,
      positioning: mergePositioningWithSummary(
        copilot.plan.positioning,
        copilot.plan.summaryStrategy
      ),
    },
  };

  try {
    const { planId } = await applyCopilotToWorkspace({
      sellerId: auth.user.id,
      auctionId,
      planRow: {
        objective: copilotForSave.plan.objective,
        audience: copilotForSave.plan.audience,
        positioning: copilotForSave.plan.positioning,
        channels: copilotForSave.plan.channels,
      },
      tasks: copilotForSave.tasks,
      artifacts: copilotForSave.artifacts,
    });

    const plan = await prisma.listingMarketingPlan.findUnique({
      where: { id: planId },
      include: {
        tasks: { orderBy: { sortOrder: "asc" } },
        artifacts: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!plan) {
      return NextResponse.json({ message: "Plan missing after apply." }, { status: 500 });
    }

    return NextResponse.json({ plan: serializeWorkspacePlan(plan) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "APPLY_FAILED";
    if (msg === "LISTING_NOT_FOUND") {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }
    if (msg === "PLAN_FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    console.error("[marketing/copilot/apply]", e);
    return NextResponse.json({ message: "Apply failed." }, { status: 500 });
  }
}
