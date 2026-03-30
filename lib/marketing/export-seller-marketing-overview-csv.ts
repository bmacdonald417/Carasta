import { MarketingCampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  getSellerMarketingAuctionRows,
  SELLER_MARKETING_AUCTION_EXPORT_LIMIT,
} from "@/lib/marketing/get-seller-marketing-auction-rows";
import { csvDocument } from "@/lib/marketing/csv-utils";

const HEADERS = [
  "Auction ID",
  "Title",
  "Status",
  "Created At",
  "End At",
  "Total Views",
  "Share Clicks",
  "Bid Clicks",
  "Last Marketing Activity",
  "Active Campaign Count",
] as const;

/**
 * Seller marketing overview — one row per listing (capped).
 */
export async function buildSellerMarketingOverviewCsv(
  sellerId: string
): Promise<string> {
  const [rows, activeGroups] = await Promise.all([
    getSellerMarketingAuctionRows(sellerId, {
      limit: SELLER_MARKETING_AUCTION_EXPORT_LIMIT,
    }),
    prisma.campaign.groupBy({
      by: ["auctionId"],
      where: {
        userId: sellerId,
        status: MarketingCampaignStatus.ACTIVE,
      },
      _count: { _all: true },
    }),
  ]);

  const activeByAuction = new Map(
    activeGroups.map((g) => [g.auctionId, g._count._all])
  );

  const dataRows = rows.map((a) => [
    a.id,
    a.title,
    a.status,
    a.createdAt.toISOString(),
    a.endAt.toISOString(),
    a.totalViews,
    a.totalShareClicks,
    a.totalBidClicks,
    a.lastMarketingActivityAt?.toISOString() ?? "",
    activeByAuction.get(a.id) ?? 0,
  ]);

  return csvDocument([...HEADERS], dataRows);
}
