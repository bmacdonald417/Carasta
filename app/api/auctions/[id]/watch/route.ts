import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import {
  isWatchingAuction,
  unwatchAuction,
  watchAuction,
} from "@/lib/auctions/auction-watch-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET — `{ ok, watching }` for the signed-in viewer.
 * POST — add watch. DELETE — remove watch. All require auth.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: auctionId } = await params;
  const watching = await isWatchingAuction({ userId, auctionId });
  return NextResponse.json({ ok: true, watching });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(_req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: auctionId } = await params;
  const result = await watchAuction({ userId, auctionId });
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(_req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: auctionId } = await params;
  await unwatchAuction({ userId, auctionId });
  return NextResponse.json({ ok: true });
}
