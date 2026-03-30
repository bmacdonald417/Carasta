import { prisma } from "@/lib/db";
import { MARKETING_NOTIFICATION_PREFIX } from "@/lib/marketing/marketing-notification-types";
import type { MarketingNotificationPayload } from "@/lib/marketing/marketing-notification-types";

export type SellerMarketingNotificationRow = {
  id: string;
  type: string;
  title: string;
  marketingHref: string | null;
  auctionId: string | null;
  campaignId: string | null;
  createdAt: Date;
  readAt: Date | null;
};

function parsePayload(raw: string): MarketingNotificationPayload {
  try {
    return JSON.parse(raw) as MarketingNotificationPayload;
  } catch {
    return { title: "Marketing update" };
  }
}

/** Recent marketing-tagged notifications for seller-only UI. */
export async function getSellerMarketingNotifications(
  userId: string,
  take = 8
): Promise<SellerMarketingNotificationRow[]> {
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      type: { startsWith: MARKETING_NOTIFICATION_PREFIX },
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      payloadJson: true,
      createdAt: true,
      readAt: true,
    },
  });

  return rows.map((r) => {
    const p = parsePayload(r.payloadJson);
    return {
      id: r.id,
      type: r.type,
      title: p.title,
      marketingHref: p.marketingHref ?? null,
      auctionId: p.auctionId ?? null,
      campaignId: p.campaignId ?? null,
      createdAt: r.createdAt,
      readAt: r.readAt,
    };
  });
}
