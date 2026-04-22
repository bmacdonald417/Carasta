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
      <header className="rounded-2xl border border-border bg-card p-6 shadow-e1 md:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Seller workflow
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Sell your car
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Create a live listing with clear vehicle details, reserve, and optional buy-now (first 24
          hours only). You can save a draft at any step.
        </p>
        <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          After a listing exists, open{" "}
          <span className="font-medium text-foreground">Marketing</span> from your profile (or use{" "}
          <span className="font-medium text-foreground">AI copilot</span> on a listing card) when{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px] text-foreground">
            MARKETING_ENABLED=true
          </code>
          .
        </p>
      </header>
      <ContextualHelpCard context="market.sell" className="mt-6" />
      <CreateAuctionWizard className="mt-8" listingAiEnabled={listingAiEnabled} />
    </div>
  );
}
