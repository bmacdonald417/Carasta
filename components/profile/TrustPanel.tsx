import Link from "next/link";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import type { CollectorTier } from "@prisma/client";

type TrustPanelProps = {
  collectorTier: CollectorTier;
  reputationScore?: number;
  completedSalesCount: number;
  completedPurchasesCount: number;
  disputesLostCount: number;
};

export function TrustPanel({
  collectorTier,
  reputationScore,
  completedSalesCount,
  completedPurchasesCount,
  disputesLostCount,
}: TrustPanelProps) {
  return (
    <div className="mt-6 rounded-xl border border-border/50 bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ReputationBadge tier={collectorTier} />
          {reputationScore != null && reputationScore > 0 && (
            <span className="text-sm text-muted-foreground">
              {reputationScore} pts
            </span>
          )}
        </div>
        <Link
          href="/how-it-works#reputation"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          How reputation works
        </Link>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-muted-foreground">
          <strong className="text-foreground">{completedSalesCount}</strong> sales
        </span>
        <span className="text-muted-foreground">
          <strong className="text-foreground">{completedPurchasesCount}</strong>{" "}
          purchases
        </span>
        {disputesLostCount > 0 && (
          <span className="text-muted-foreground">
            <strong className="text-foreground">{disputesLostCount}</strong>{" "}
            disputes lost
          </span>
        )}
      </div>
    </div>
  );
}
