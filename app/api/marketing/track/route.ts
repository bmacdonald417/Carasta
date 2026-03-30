import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { MarketingTrafficEventType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { recordTrafficEvent } from "@/lib/marketing/track-marketing-event-server";
import { marketingTrackBodySchema } from "@/lib/validations/marketing";
import { sanitizeMarketingMetadata } from "@/lib/marketing/sanitize-marketing-metadata";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isMarketingEnabled()) {
      return new NextResponse(null, { status: 204 });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const parsed = marketingTrackBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const body = parsed.data;
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const userId = token?.sub ?? null;

    const auction = await prisma.auction.findUnique({
      where: { id: body.auctionId },
      select: { id: true },
    });
    if (!auction) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const eventType =
      body.eventType === "VIEW"
        ? MarketingTrafficEventType.VIEW
        : body.eventType === "SHARE_CLICK"
          ? MarketingTrafficEventType.SHARE_CLICK
          : MarketingTrafficEventType.BID_CLICK;

    const meta = sanitizeMarketingMetadata({
      ...(body.metadata as Record<string, unknown> | undefined),
    });

    await recordTrafficEvent({
      auctionId: body.auctionId,
      eventType,
      userId,
      sourceOverride: body.source,
      visitorKey: body.visitorKey ?? null,
      metadata: meta,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
