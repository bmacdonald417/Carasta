import { MarketingCampaignStatus } from "@prisma/client";
import { SellerStatusBadge } from "@/components/marketing/seller-workspace-primitives";

const TONES: Record<
  MarketingCampaignStatus,
  "neutral" | "success" | "caution"
> = {
  [MarketingCampaignStatus.DRAFT]: "neutral",
  [MarketingCampaignStatus.ACTIVE]: "success",
  [MarketingCampaignStatus.PAUSED]: "caution",
  [MarketingCampaignStatus.ENDED]: "neutral",
};

/** ENDED shown to sellers as "Completed" (schema uses ENDED). */
export function campaignStatusLabel(status: MarketingCampaignStatus): string {
  switch (status) {
    case MarketingCampaignStatus.DRAFT:
      return "Draft";
    case MarketingCampaignStatus.ACTIVE:
      return "Active";
    case MarketingCampaignStatus.PAUSED:
      return "Paused";
    case MarketingCampaignStatus.ENDED:
      return "Completed";
  }
}

export function CampaignStatusBadge({ status }: { status: MarketingCampaignStatus }) {
  return <SellerStatusBadge label={campaignStatusLabel(status)} tone={TONES[status]} />;
}
