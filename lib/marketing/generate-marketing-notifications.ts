import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import {
  type MarketingNotificationPayload,
  MarketingNotificationType,
} from "@/lib/marketing/marketing-notification-types";
import { MarketingCampaignStatus, MarketingTrafficEventType } from "@prisma/client";

/** Suppress another row with same `type` + entity for this long. */
const DEDUPE_HOURS_AUCTION = 72;
const DEDUPE_HOURS_CAMPAIGN = 120;

const ENDING_SOON_HOURS = 48;
const NO_ACTIVITY_DAYS = 7;
const HIGH_VIEWS_7D = 25;
const HIGH_BID_CLICKS_7D = 5;
const LOW_VIEWS_7D = 8;
const LOW_BID_CLICKS_7D = 2;
const BID_SURGE_24H = 10;

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

function payloadJson(p: MarketingNotificationPayload): string {
  return JSON.stringify(p);
}

async function recentAuctionNotification(
  userId: string,
  type: string,
  auctionId: string,
  since: Date
): Promise<boolean> {
  const needle = `"auctionId":"${auctionId}"`;
  const row = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      createdAt: { gte: since },
      payloadJson: { contains: needle },
    },
    select: { id: true },
  });
  return !!row;
}

async function recentCampaignNotification(
  userId: string,
  campaignId: string,
  since: Date
): Promise<boolean> {
  const needle = `"campaignId":"${campaignId}"`;
  const row = await prisma.notification.findFirst({
    where: {
      userId,
      type: MarketingNotificationType.CAMPAIGN_START,
      createdAt: { gte: since },
      payloadJson: { contains: needle },
    },
    select: { id: true },
  });
  return !!row;
}

async function createMarketingNotification(
  userId: string,
  type: string,
  payload: MarketingNotificationPayload
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      payloadJson: payloadJson(payload),
    },
  });
}

type CountMap = Map<string, number>;

function mapFromGroup(
  rows: { auctionId: string; _count: { _all: number } }[]
): CountMap {
  return new Map(rows.map((r) => [r.auctionId, r._count._all]));
}

/**
 * Idempotent best-effort generator: evaluates deterministic rules and inserts
 * `Notification` rows only when thresholds hit and no duplicate in the dedupe window.
 *
 * Trigger: seller marketing overview (and optionally drill-down) server render — safe
 * to call on every navigation; bounded work (caps on auctions scanned).
 */
export async function ensureSellerMarketingNotifications(
  sellerId: string,
  handle: string
): Promise<void> {
  if (!isMarketingEnabled()) return;

  const handleLower = handle.toLowerCase();
  const now = new Date();
  const endingCutoff = new Date(
    now.getTime() + ENDING_SOON_HOURS * 60 * 60 * 1000
  );
  const cutoff7 = daysAgo(NO_ACTIVITY_DAYS);
  const cutoff24 = hoursAgo(24);
  const dedupeAuctionSince = hoursAgo(DEDUPE_HOURS_AUCTION);
  const dedupeCampaignSince = hoursAgo(DEDUPE_HOURS_CAMPAIGN);

  const liveAuctions = await prisma.auction.findMany({
    where: {
      sellerId,
      status: "LIVE",
      endAt: { gt: now },
    },
    select: { id: true, title: true, endAt: true },
    orderBy: { endAt: "asc" },
    take: 80,
  });

  if (liveAuctions.length === 0) {
    await maybeCampaignStarts({
      sellerId,
      handleLower,
      now,
      dedupeCampaignSince,
    });
    return;
  }

  const ids = liveAuctions.map((a) => a.id);

  const [views7, shares7, bidClicks7, bidClicks24] = await Promise.all([
    prisma.trafficEvent.groupBy({
      by: ["auctionId"],
      where: {
        auctionId: { in: ids },
        eventType: MarketingTrafficEventType.VIEW,
        createdAt: { gte: cutoff7 },
      },
      _count: { _all: true },
    }),
    prisma.trafficEvent.groupBy({
      by: ["auctionId"],
      where: {
        auctionId: { in: ids },
        eventType: MarketingTrafficEventType.SHARE_CLICK,
        createdAt: { gte: cutoff7 },
      },
      _count: { _all: true },
    }),
    prisma.trafficEvent.groupBy({
      by: ["auctionId"],
      where: {
        auctionId: { in: ids },
        eventType: MarketingTrafficEventType.BID_CLICK,
        createdAt: { gte: cutoff7 },
      },
      _count: { _all: true },
    }),
    prisma.trafficEvent.groupBy({
      by: ["auctionId"],
      where: {
        auctionId: { in: ids },
        eventType: MarketingTrafficEventType.BID_CLICK,
        createdAt: { gte: cutoff24 },
      },
      _count: { _all: true },
    }),
  ]);

  const v7 = mapFromGroup(views7);
  const s7 = mapFromGroup(shares7);
  const b7 = mapFromGroup(bidClicks7);
  const b24 = mapFromGroup(bidClicks24);

  const lastActivity = await prisma.trafficEvent.groupBy({
    by: ["auctionId"],
    where: { auctionId: { in: ids } },
    _max: { createdAt: true },
  });
  const lastAt = new Map(
    lastActivity.map((r) => [r.auctionId, r._max.createdAt])
  );

  for (const a of liveAuctions) {
    const views = v7.get(a.id) ?? 0;
    const shares = s7.get(a.id) ?? 0;
    const bids7 = b7.get(a.id) ?? 0;
    const bids24 = b24.get(a.id) ?? 0;
    const any7 = views + shares + bids7;
    const last = lastAt.get(a.id) ?? null;

    const endingSoon = a.endAt <= endingCutoff;
    const engagement7 = views + shares + bids7;

    const basePayload = (title: string): MarketingNotificationPayload => ({
      title,
      auctionId: a.id,
      marketingHref: `/u/${handleLower}/marketing/auctions/${a.id}`,
    });

    if (endingSoon) {
      const high = views >= HIGH_VIEWS_7D || bids7 >= HIGH_BID_CLICKS_7D;
      const low = views < LOW_VIEWS_7D && bids7 < LOW_BID_CLICKS_7D;

      if (high) {
        const exists = await recentAuctionNotification(
          sellerId,
          MarketingNotificationType.ENDING_SOON_HIGH_INTEREST,
          a.id,
          dedupeAuctionSince
        );
        if (!exists) {
          await createMarketingNotification(
            sellerId,
            MarketingNotificationType.ENDING_SOON_HIGH_INTEREST,
            basePayload(
              `Strong interest before the finish: “${a.title.slice(0, 60)}${a.title.length > 60 ? "…" : ""}” ends soon.`
            )
          );
        }
      } else if (low) {
        const exists = await recentAuctionNotification(
          sellerId,
          MarketingNotificationType.ENDING_SOON_LOW_INTEREST,
          a.id,
          dedupeAuctionSince
        );
        if (!exists) {
          await createMarketingNotification(
            sellerId,
            MarketingNotificationType.ENDING_SOON_LOW_INTEREST,
            basePayload(
              `Listing ending soon with light engagement: “${a.title.slice(0, 56)}${a.title.length > 56 ? "…" : ""}” — consider a final push.`
            )
          );
        }
      }
    }

    if (bids24 >= BID_SURGE_24H) {
      const exists = await recentAuctionNotification(
        sellerId,
        MarketingNotificationType.BID_CLICK_SURGE,
        a.id,
        dedupeAuctionSince
      );
      if (!exists) {
        await createMarketingNotification(
          sellerId,
          MarketingNotificationType.BID_CLICK_SURGE,
          basePayload(
            `Bid button activity picked up on “${a.title.slice(0, 56)}${a.title.length > 56 ? "…" : ""}” in the last 24 hours.`
          )
        );
      }
    }

    const quietLong =
      !endingSoon &&
      engagement7 === 0 &&
      (!last || last < cutoff7);

    if (quietLong) {
      const exists = await recentAuctionNotification(
        sellerId,
        MarketingNotificationType.NO_RECENT_ACTIVITY,
        a.id,
        dedupeAuctionSince
      );
      if (!exists) {
        await createMarketingNotification(
          sellerId,
          MarketingNotificationType.NO_RECENT_ACTIVITY,
          basePayload(
            `No tracked views, shares, or bid intent in 7 days on “${a.title.slice(0, 56)}${a.title.length > 56 ? "…" : ""}”.`
          )
        );
      }
    }
  }

  await maybeCampaignStarts({
    sellerId,
    handleLower,
    now,
    dedupeCampaignSince,
  });
}

async function maybeCampaignStarts(params: {
  sellerId: string;
  handleLower: string;
  now: Date;
  dedupeCampaignSince: Date;
}): Promise<void> {
  const { sellerId, handleLower, now, dedupeCampaignSince } = params;
  const startedSince = hoursAgo(72);

  const campaigns = await prisma.campaign.findMany({
    where: {
      userId: sellerId,
      status: MarketingCampaignStatus.ACTIVE,
      startAt: { lte: now, gte: startedSince },
    },
    select: {
      id: true,
      name: true,
      auctionId: true,
    },
    take: 30,
  });

  for (const c of campaigns) {
    const exists = await recentCampaignNotification(
      sellerId,
      c.id,
      dedupeCampaignSince
    );
    if (exists) continue;

    const payload: MarketingNotificationPayload = {
      title: `Campaign “${c.name.slice(0, 80)}${c.name.length > 80 ? "…" : ""}” is active (start date reached).`,
      campaignId: c.id,
      auctionId: c.auctionId,
      marketingHref: `/u/${handleLower}/marketing/auctions/${c.auctionId}`,
    };
    await createMarketingNotification(
      sellerId,
      MarketingNotificationType.CAMPAIGN_START,
      payload
    );
  }
}
