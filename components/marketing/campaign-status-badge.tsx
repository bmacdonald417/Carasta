import { MarketingCampaignStatus } from "@prisma/client";

const STYLES: Record<MarketingCampaignStatus, string> = {
  [MarketingCampaignStatus.DRAFT]:
    "border border-neutral-500/50 bg-neutral-500/20 text-neutral-400",
  [MarketingCampaignStatus.ACTIVE]:
    "border border-green-500/50 bg-green-500/20 text-green-400",
  [MarketingCampaignStatus.PAUSED]:
    "border border-amber-500/50 bg-amber-500/20 text-amber-300",
  [MarketingCampaignStatus.ENDED]:
    "border border-white/20 bg-white/10 text-neutral-300",
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
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${STYLES[status]}`}
    >
      {campaignStatusLabel(status)}
    </span>
  );
}
