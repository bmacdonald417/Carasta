import Link from "next/link";

import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import type { CollectorTier } from "@prisma/client";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

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
    <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-e1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ReputationBadge tier={collectorTier} />
          {reputationScore != null && reputationScore > 0 && (
            <span className="text-sm text-muted-foreground">{reputationScore} pts</span>
          )}
        </div>
        <Link
          href="/how-it-works#reputation"
          className={cn(
            "text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground",
            shellFocusRing,
            "rounded-sm"
          )}
        >
          How reputation works
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          <strong className="font-semibold text-foreground">{completedSalesCount}</strong> sales
        </span>
        <span className="text-muted-foreground">
          <strong className="font-semibold text-foreground">{completedPurchasesCount}</strong> purchases
        </span>
        {disputesLostCount > 0 ? (
          <span className="text-muted-foreground">
            <strong className="font-semibold text-destructive">{disputesLostCount}</strong> disputes lost
          </span>
        ) : null}
      </div>
    </div>
  );
}
