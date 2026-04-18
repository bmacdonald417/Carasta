import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { listWatchedAuctionSummaries } from "@/lib/auctions/auction-watch-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/carmunity/watchlist — saved auctions for the signed-in user (Carmunity).
 */
export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const items = await listWatchedAuctionSummaries(userId);
  return NextResponse.json({
    ok: true,
    items,
    auctionIds: items.map((i) => i.id),
  });
}
