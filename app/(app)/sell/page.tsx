import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CreateAuctionWizard } from "./create-auction-wizard";
import { isListingAiEnabled } from "@/lib/listing-ai/listing-ai-feature-flag";

export default async function SellPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const listingAiEnabled = isListingAiEnabled();

  return (
    <div className="carasta-container max-w-2xl py-8">
      <h1 className="font-display text-2xl font-bold">Sell your car</h1>
      <p className="mt-1 text-muted-foreground">
        Create a listing. Set reserve and optional buy-now (first 24h only).
      </p>
      <p className="mt-2 text-xs text-neutral-500">
        After a listing exists, use{" "}
        <span className="text-neutral-400">Marketing → Open marketing</span> (or{" "}
        <span className="text-neutral-400">AI copilot</span> on a listing card) for the marketing
        workspace when <span className="text-neutral-400">MARKETING_ENABLED=true</span>.
      </p>
      <CreateAuctionWizard className="mt-6" listingAiEnabled={listingAiEnabled} />
    </div>
  );
}
