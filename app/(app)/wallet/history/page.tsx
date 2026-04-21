import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { WalletHistoryClient } from "./wallet-history-client";

export default async function WalletHistoryPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  return (
    <div className="carasta-container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
        Carasta Coin history
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Immutable ledger entries for your wallet.
      </p>
      <div className="mt-6">
        <WalletHistoryClient />
      </div>
    </div>
  );
}

