import { getMarketingCopilotModel } from "@/lib/marketing/marketing-copilot-openai";

export function getListingAiModel(): string {
  return process.env.LISTING_AI_MODEL?.trim() || getMarketingCopilotModel();
}
