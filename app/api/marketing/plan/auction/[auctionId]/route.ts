import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertAuctionOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { serializeWorkspacePlan } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/marketing/plan/auction/[auctionId]
 * Resolves the workspace plan for a listing (seller-only). See CARMUNITY_PHASE_P1_SELLER_WORKSPACE.md for path note.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ auctionId: string }> }
) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  const { auctionId } = await context.params;
  const auction = await assertAuctionOwnedBySeller(auctionId, auth.user.id);
  if (!auction) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const plan = await prisma.listingMarketingPlan.findUnique({
    where: { auctionId },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      artifacts: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  return NextResponse.json({ plan: plan ? serializeWorkspacePlan(plan) : null });
}
