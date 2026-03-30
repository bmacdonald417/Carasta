import {
  MarketingTrafficEventType,
  MarketingTrafficSource,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { tryIncrementAuctionAnalyticsRollup } from "@/lib/marketing/increment-auction-analytics-rollup";
import { inferMarketingSourceFromSignals } from "@/lib/marketing/resolve-marketing-source";
import { sanitizeMarketingMetadata } from "@/lib/marketing/sanitize-marketing-metadata";
import { normalizeMarketingVisitorKey } from "@/lib/marketing/visitor-key";

const VIEW_DEDUPE_MS = 60_000;
const SHARE_DEDUPE_MS = 5_000;
/** Per-surface bid intent: suppress rapid double-fires on the same CTA (~12s). */
const BID_CLICK_DEDUPE_MS = 12_000;

export async function recordTrafficEvent(input: {
  auctionId: string;
  eventType: MarketingTrafficEventType;
  userId: string | null | undefined;
  sourceOverride?: MarketingTrafficSource;
  metadata?: Record<string, unknown>;
  visitorKey?: string | null;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const userId = input.userId ?? null;
  const visitorKey = normalizeMarketingVisitorKey(input.visitorKey);
  const recordedAt = new Date();
  const metaRaw = sanitizeMarketingMetadata(input.metadata) ?? undefined;
  const shareTarget =
    typeof metaRaw?.shareTarget === "string" ? metaRaw.shareTarget : null;

  const mergedMeta: Record<string, unknown> | undefined = metaRaw
    ? {
        ...metaRaw,
        ...(visitorKey ? { visitorKey } : {}),
      }
    : visitorKey
      ? { visitorKey }
      : undefined;

  const source = inferMarketingSourceFromSignals({
    explicit: input.sourceOverride,
    currentUrl:
      typeof metaRaw?.currentUrl === "string" ? metaRaw.currentUrl : undefined,
    referrer:
      typeof metaRaw?.referrer === "string" ? metaRaw.referrer : undefined,
  });

  if (input.eventType === MarketingTrafficEventType.VIEW) {
    const dup = await findRecentViewDuplicate({
      auctionId: input.auctionId,
      userId,
      visitorKey,
      windowMs: VIEW_DEDUPE_MS,
    });
    if (dup) return { ok: true, skipped: true };
  }

  if (input.eventType === MarketingTrafficEventType.SHARE_CLICK) {
    const dup = await findRecentShareDuplicate({
      auctionId: input.auctionId,
      userId,
      visitorKey,
      shareTarget,
      windowMs: SHARE_DEDUPE_MS,
    });
    if (dup) return { ok: true, skipped: true };
  }

  if (input.eventType === MarketingTrafficEventType.BID_CLICK) {
    const surface =
      typeof metaRaw?.bidUiSurface === "string" ? metaRaw.bidUiSurface : "";
    const dup = await findRecentBidClickDuplicate({
      auctionId: input.auctionId,
      userId,
      visitorKey,
      bidUiSurface: surface,
      windowMs: BID_CLICK_DEDUPE_MS,
    });
    if (dup) return { ok: true, skipped: true };
  }

  await prisma.trafficEvent.create({
    data: {
      auctionId: input.auctionId,
      userId,
      eventType: input.eventType,
      source,
      metadata:
        mergedMeta && Object.keys(mergedMeta).length > 0
          ? (mergedMeta as Prisma.InputJsonValue)
          : undefined,
    },
  });

  await tryIncrementAuctionAnalyticsRollup({
    auctionId: input.auctionId,
    eventType: input.eventType,
    recordedAt,
  });

  return { ok: true };
}

async function findRecentViewDuplicate(params: {
  auctionId: string;
  userId: string | null;
  visitorKey: string | null;
  windowMs: number;
}): Promise<boolean> {
  const since = new Date(Date.now() - params.windowMs);

  if (params.userId) {
    const row = await prisma.trafficEvent.findFirst({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.VIEW,
        userId: params.userId,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    return !!row;
  }

  if (params.visitorKey) {
    const row = await prisma.trafficEvent.findFirst({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.VIEW,
        userId: null,
        createdAt: { gte: since },
        metadata: {
          path: ["visitorKey"],
          equals: params.visitorKey,
        },
      },
      select: { id: true },
    });
    return !!row;
  }

  return false;
}

async function findRecentShareDuplicate(params: {
  auctionId: string;
  userId: string | null;
  visitorKey: string | null;
  shareTarget: string | null;
  windowMs: number;
}): Promise<boolean> {
  const since = new Date(Date.now() - params.windowMs);
  const target = params.shareTarget ?? "";

  if (params.userId) {
    const row = await prisma.trafficEvent.findFirst({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.SHARE_CLICK,
        userId: params.userId,
        createdAt: { gte: since },
        metadata: {
          path: ["shareTarget"],
          equals: target,
        },
      },
      select: { id: true },
    });
    return !!row;
  }

  if (params.visitorKey) {
    const row = await prisma.trafficEvent.findFirst({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.SHARE_CLICK,
        userId: null,
        createdAt: { gte: since },
        AND: [
          { metadata: { path: ["shareTarget"], equals: target } },
          { metadata: { path: ["visitorKey"], equals: params.visitorKey } },
        ],
      },
      select: { id: true },
    });
    return !!row;
  }

  return false;
}

async function findRecentBidClickDuplicate(params: {
  auctionId: string;
  userId: string | null;
  visitorKey: string | null;
  bidUiSurface: string;
  windowMs: number;
}): Promise<boolean> {
  const since = new Date(Date.now() - params.windowMs);
  const surface = params.bidUiSurface;

  if (params.userId) {
    const row = await prisma.trafficEvent.findFirst({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.BID_CLICK,
        userId: params.userId,
        createdAt: { gte: since },
        metadata: {
          path: ["bidUiSurface"],
          equals: surface,
        },
      },
      select: { id: true },
    });
    return !!row;
  }

  if (params.visitorKey) {
    const row = await prisma.trafficEvent.findFirst({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.BID_CLICK,
        userId: null,
        createdAt: { gte: since },
        AND: [
          { metadata: { path: ["bidUiSurface"], equals: surface } },
          { metadata: { path: ["visitorKey"], equals: params.visitorKey } },
        ],
      },
      select: { id: true },
    });
    return !!row;
  }

  return false;
}
