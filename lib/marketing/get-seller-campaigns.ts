import { prisma } from "@/lib/db";

export type SellerCampaignListRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  startAt: Date | null;
  endAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  auctionId: string;
  auctionTitle: string;
};

export async function getRecentSellerCampaigns(
  sellerId: string,
  take = 8
): Promise<SellerCampaignListRow[]> {
  const rows = await prisma.campaign.findMany({
    where: { userId: sellerId },
    orderBy: { updatedAt: "desc" },
    take,
    include: {
      auction: { select: { id: true, title: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    startAt: c.startAt,
    endAt: c.endAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    auctionId: c.auctionId,
    auctionTitle: c.auction.title,
  }));
}

export async function getAllSellerCampaigns(
  sellerId: string,
  take = 50
): Promise<SellerCampaignListRow[]> {
  return getRecentSellerCampaigns(sellerId, take);
}

const CAMPAIGN_EXPORT_CAP = 2000;

/** Full campaign list for CSV export (newest first, capped). */
export async function getSellerCampaignsForExport(
  sellerId: string
): Promise<SellerCampaignListRow[]> {
  const rows = await prisma.campaign.findMany({
    where: { userId: sellerId },
    orderBy: { updatedAt: "desc" },
    take: CAMPAIGN_EXPORT_CAP,
    include: {
      auction: { select: { id: true, title: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    startAt: c.startAt,
    endAt: c.endAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    auctionId: c.auctionId,
    auctionTitle: c.auction.title,
  }));
}

export async function getAuctionCampaignsForSeller(
  sellerId: string,
  auctionId: string
): Promise<SellerCampaignListRow[]> {
  const rows = await prisma.campaign.findMany({
    where: { userId: sellerId, auctionId },
    orderBy: { updatedAt: "desc" },
    include: {
      auction: { select: { id: true, title: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    startAt: c.startAt,
    endAt: c.endAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    auctionId: c.auctionId,
    auctionTitle: c.auction.title,
  }));
}

export type SellerAuctionOption = { id: string; title: string };

export async function getSellerAuctionOptions(
  sellerId: string
): Promise<SellerAuctionOption[]> {
  const auctions = await prisma.auction.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, title: true },
  });
  return auctions;
}

export async function getCampaignForSellerEdit(
  campaignId: string,
  sellerId: string
) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, userId: sellerId },
    include: {
      auction: { select: { id: true, title: true } },
    },
  });
}
