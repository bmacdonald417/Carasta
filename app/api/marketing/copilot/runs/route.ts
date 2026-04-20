import { NextResponse } from "next/server";
import {
  assertAuctionOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { prisma } from "@/lib/db";
import { formatMarketingCopilotRunRow } from "@/lib/marketing/format-marketing-copilot-run-for-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/marketing/copilot/runs?auctionId=…&limit=20
 * Seller-only MarketingCopilotRun history for a listing.
 */
export async function GET(req: Request) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const auctionId = searchParams.get("auctionId")?.trim();
  if (!auctionId) {
    return NextResponse.json({ message: "auctionId is required." }, { status: 400 });
  }

  const owned = await assertAuctionOwnedBySeller(auctionId, auth.user.id);
  if (!owned) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 20;

  const rows = await prisma.marketingCopilotRun.findMany({
    where: { auctionId, createdById: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      model: true,
      appliedAt: true,
      intakeJson: true,
      outputJson: true,
    },
  });

  const runs = rows.map((r) => {
    const f = formatMarketingCopilotRunRow(r);
    return {
      id: f.id,
      createdAt: f.createdAt,
      model: f.model,
      kind: f.kind,
      applied: f.applied,
      preview: f.preview,
      intakeSummary: f.intakeSummary,
    };
  });

  return NextResponse.json({ runs });
}
