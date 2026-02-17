import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CreateAuctionWizard } from "./create-auction-wizard";

export default async function SellPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Sell your car</h1>
      <p className="mt-1 text-muted-foreground">
        Create a listing. Set reserve and optional buy-now (first 24h only).
      </p>
      <CreateAuctionWizard className="mt-6" />
    </div>
  );
}
