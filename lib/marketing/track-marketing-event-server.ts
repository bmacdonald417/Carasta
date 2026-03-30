import {
  MarketingTrafficEventType,
  MarketingTrafficSource,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { inferMarketingSourceFromSignals } from "@/lib/marketing/resolve-marketing-source";
import { sanitizeMarketingMetadata } from "@/lib/marketing/sanitize-marketing-metadata";

const VIEW_DEDUPE_MS = 60_000;
const SHARE_DEDUPE_MS = 5_000;

export async function recordTrafficEvent(input: {
  auctionId: string;
  eventType: MarketingTrafficEventType;
  userId: string | null | undefined;
  sourceOverride?: MarketingTrafficSource;
  metadata?: Record<string, unknown>;
  visitorKey?: string | null;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const userId = input.userId ?? null;
  const metaRaw = sanitizeMarketingMetadata(input.metadata) ?? undefined;
  const shareTarget =
    typeof metaRaw?.shareTarget === "string" ? metaRaw.shareTarget : null;

  const mergedMeta: Record<string, unknown> | undefined = metaRaw
    ? {
        ...metaRaw,
        ...(input.visitorKey ? { visitorKey: input.visitorKey } : {}),
      }
    : input.visitorKey
      ? { visitorKey: input.visitorKey }
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
      visitorKey: input.visitorKey ?? null,
      windowMs: VIEW_DEDUPE_MS,
    });
    if (dup) return { ok: true, skipped: true };
  }

  if (input.eventType === MarketingTrafficEventType.SHARE_CLICK) {
    const dup = await findRecentShareDuplicate({
      auctionId: input.auctionId,
      userId,
      visitorKey: input.visitorKey ?? null,
      shareTarget,
      windowMs: SHARE_DEDUPE_MS,
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
    const rows = await prisma.trafficEvent.findMany({
      where: {
        auctionId: params.auctionId,
        eventType: MarketingTrafficEventType.VIEW,
        userId: null,
        createdAt: { gte: since },
      },
      select: { metadata: true },
      take: 25,
    });
    return rows.some((r) => {
      const m = r.metadata as Record<string, unknown> | null;
      return m?.visitorKey === params.visitorKey;
    });
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

  const rows = await prisma.trafficEvent.findMany({
    where: {
      auctionId: params.auctionId,
      eventType: MarketingTrafficEventType.SHARE_CLICK,
      createdAt: { gte: since },
      ...(params.userId
        ? { userId: params.userId }
        : { userId: null }),
    },
    select: { metadata: true },
    take: 25,
  });

  return rows.some((r) => {
    const m = r.metadata as Record<string, unknown> | null;
    if (!m || (m.shareTarget ?? "") !== target) return false;
    if (params.userId) return true;
    if (params.visitorKey) return m.visitorKey === params.visitorKey;
    return false;
  });
}
