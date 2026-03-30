import { getSellerCampaignsForExport } from "@/lib/marketing/get-seller-campaigns";
import { csvDocument } from "@/lib/marketing/csv-utils";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";

const HEADERS = [
  "Campaign ID",
  "Name",
  "Auction ID",
  "Auction Title",
  "Type",
  "Type Label",
  "Status",
  "Start At",
  "End At",
  "Created At",
  "Updated At",
] as const;

export async function buildSellerCampaignsCsv(
  sellerId: string
): Promise<string> {
  const rows = await getSellerCampaignsForExport(sellerId);
  const dataRows = rows.map((c) => [
    c.id,
    c.name,
    c.auctionId,
    c.auctionTitle,
    c.type,
    campaignTypeLabel(c.type),
    c.status,
    c.startAt?.toISOString() ?? "",
    c.endAt?.toISOString() ?? "",
    c.createdAt.toISOString(),
    c.updatedAt.toISOString(),
  ]);
  return csvDocument([...HEADERS], dataRows);
}
