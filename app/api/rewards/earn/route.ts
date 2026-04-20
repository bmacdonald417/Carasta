import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { postEarnEventBodySchema } from "@/lib/validations/rewards/wallet";
import { awardCreditsForEvent } from "@/lib/rewards/events/award";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/rewards/earn
 * MVP: server-side gated earn event ingestion for trusted sources (web/mobile user actions).
 * In production, most events should be emitted internally, not by arbitrary clients.
 */
export async function POST(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postEarnEventBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const res = await awardCreditsForEvent({
    idempotencyKey: parsed.data.idempotencyKey,
    userId,
    source: "USER",
    reasonCode: parsed.data.reasonCode,
    auctionId: parsed.data.auctionId ?? null,
    rewardCampaignId: parsed.data.rewardCampaignId ?? null,
    metadata: parsed.data.metadata ?? {},
  });

  return NextResponse.json({ ok: true, result: res });
}

