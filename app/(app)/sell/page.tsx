import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { CreateAuctionWizard } from "./create-auction-wizard";
import { isListingAiEnabled } from "@/lib/listing-ai/listing-ai-feature-flag";

export default async function SellPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const listingAiEnabled = isListingAiEnabled();

  return (
    <div className="carasta-container max-w-2xl py-8 md:py-10">
      <ContextualHelpCard context="market.sell" className="mb-4" />
      <CreateAuctionWizard className="mt-0" listingAiEnabled={listingAiEnabled} />
    </div>
  );
}
