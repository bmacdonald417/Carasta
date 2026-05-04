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
      <header className="mb-6 border-b border-border pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Marketplace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">List a Vehicle</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a collector car auction on Carmunity.
            </p>
          </div>
          {listingAiEnabled && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
              ✨ AI-assisted listing
            </span>
          )}
        </div>
      </header>
      <ContextualHelpCard context="market.sell" className="mb-5" />
      <CreateAuctionWizard className="mt-0" listingAiEnabled={listingAiEnabled} />
    </div>
  );
}
