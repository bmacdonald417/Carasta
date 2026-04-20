import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isListingAiEnabled } from "@/lib/listing-ai/listing-ai-feature-flag";
import { formatListingAiRunRow } from "@/lib/listing-ai/format-listing-ai-run-for-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/listings/ai/runs?auctionId=…&limit=15
 * Seller-only history for a listing (ListingAiRun rows tied to that auction).
 */
export async function GET(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!isListingAiEnabled()) {
    return NextResponse.json({ message: "Listing AI is disabled." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const auctionId = searchParams.get("auctionId")?.trim();
  if (!auctionId) {
    return NextResponse.json({ message: "auctionId is required." }, { status: 400 });
  }

  const owned = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId: userId },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "15", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 15;

  const rows = await prisma.listingAiRun.findMany({
    where: { auctionId, createdById: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      model: true,
      intakeJson: true,
      outputJson: true,
    },
  });

  const runs = rows.map((r) => {
    const f = formatListingAiRunRow(r);
    return {
      id: f.id,
      createdAt: f.createdAt,
      model: f.model,
      kind: f.kind,
      field: f.field,
      preview: f.preview,
      intakeSummary: f.intakeSummary,
    };
  });

  return NextResponse.json({ runs });
}
