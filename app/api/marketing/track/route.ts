/**
 * Marketing ingestion beacon — **`POST` only**.
 *
 * Edge / WAF guidance (path limits, POST-only, body size, trusted `X-Forwarded-For`):
 * **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`**
 *
 * In-app observability (counters + structured logs): **`MARKETING_PHASE_17_NOTES.md`**
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { MarketingTrafficEventType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { recordTrafficEvent } from "@/lib/marketing/track-marketing-event-server";
import {
  checkMarketingTrackRateLimit,
  getMarketingTrackClientIp,
} from "@/lib/marketing/marketing-track-rate-limit";
import { marketingTrackBodySchema } from "@/lib/validations/marketing";
import { observeMarketingTrackRequest } from "@/lib/marketing/marketing-track-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let eventLabel:
    | "VIEW"
    | "SHARE_CLICK"
    | "BID_CLICK"
    | "EXTERNAL_REFERRAL"
    | undefined;
  let authMode: "authenticated" | "anonymous" | "unknown" = "unknown";
  let sourceLabel: string | undefined;

  try {
    if (!isMarketingEnabled()) {
      observeMarketingTrackRequest({
        outcome: "feature_disabled",
        authMode: "unknown",
      });
      return new NextResponse(null, { status: 204 });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      const tokenEarly = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      observeMarketingTrackRequest({
        outcome: "body_parse_failed",
        authMode: tokenEarly?.sub ? "authenticated" : "anonymous",
      });
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    authMode = token?.sub ? "authenticated" : "anonymous";

    const parsed = marketingTrackBodySchema.safeParse(json);
    if (!parsed.success) {
      observeMarketingTrackRequest({
        outcome: "validation_failed",
        authMode,
      });
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const body = parsed.data;
    const userId = token?.sub ?? null;
    eventLabel = body.eventType;
    sourceLabel = body.source;

    const clientIp = getMarketingTrackClientIp(req);
    const rl = checkMarketingTrackRateLimit(
      clientIp,
      userId,
      body.eventType
    );
    if (!rl.allowed) {
      observeMarketingTrackRequest({
        outcome: "route_rate_limited",
        eventType: eventLabel,
        authMode,
        ...(sourceLabel ? { source: sourceLabel } : {}),
      });
      return NextResponse.json({ ok: true });
    }

    const auction = await prisma.auction.findUnique({
      where: { id: body.auctionId },
      select: { id: true },
    });
    if (!auction) {
      observeMarketingTrackRequest({
        outcome: "auction_not_found",
        eventType: eventLabel,
        authMode,
        ...(sourceLabel ? { source: sourceLabel } : {}),
      });
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const eventType =
      body.eventType === "VIEW"
        ? MarketingTrafficEventType.VIEW
        : body.eventType === "SHARE_CLICK"
          ? MarketingTrafficEventType.SHARE_CLICK
          : body.eventType === "EXTERNAL_REFERRAL"
            ? MarketingTrafficEventType.EXTERNAL_REFERRAL
            : MarketingTrafficEventType.BID_CLICK;

    const recorded = await recordTrafficEvent({
      auctionId: body.auctionId,
      eventType,
      userId,
      sourceOverride: body.source,
      visitorKey: body.visitorKey ?? null,
      metadata: body.metadata as Record<string, unknown> | undefined,
    });

    observeMarketingTrackRequest({
      outcome: recorded.skipped ? "event_deduped" : "event_inserted",
      eventType: eventLabel,
      authMode,
      ...(sourceLabel ? { source: sourceLabel } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch {
    observeMarketingTrackRequest({
      outcome: "server_error",
      eventType: eventLabel,
      authMode,
      ...(sourceLabel ? { source: sourceLabel } : {}),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
