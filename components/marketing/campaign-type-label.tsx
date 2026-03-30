import {
  marketingCampaignTypeSchema,
  type MarketingCampaignType,
} from "@/lib/validations/campaign";

const LABELS: Record<MarketingCampaignType, string> = {
  social: "Social",
  email: "Email",
  featured: "Featured",
  community: "Community",
};

export function campaignTypeLabel(type: string): string {
  const p = marketingCampaignTypeSchema.safeParse(type);
  if (p.success) return LABELS[p.data];
  return type;
}
