import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { WalletDashboardClient } from "./wallet-dashboard-client";

export default async function WalletPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  return (
    <div className="carasta-container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
        Carasta Coin
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Internal platform credits for perks and premium tools (not cash).
      </p>
      <div className="mt-6">
        <WalletDashboardClient />
      </div>
    </div>
  );
}

