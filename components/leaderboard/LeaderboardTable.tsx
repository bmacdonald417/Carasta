import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import { formatCurrency } from "@/lib/utils";
import type { CollectorTier } from "@prisma/client";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

type Props = {
  rows: LeaderboardRow[];
};

export function LeaderboardTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No leaderboard data yet. Complete sales or purchases to appear.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Collector
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cars Sold
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Highest Win
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Reputation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((row) => (
              <LeaderboardRow key={row.handle} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderboardRow({ row }: { row: LeaderboardRow }) {
  return (
    <tr
      className={cn(
        "group transition-all duration-300 ease-out",
        "hover:bg-accent/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        "hover:-translate-y-0.5"
      )}
    >
      <td className="px-4 py-3 font-mono text-muted-foreground">
        {row.rank}
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/u/${row.handle}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105">
            <AvatarImage src={row.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-xs font-medium">
              {row.handle.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="font-medium">@{row.handle}</span>
            <ReputationBadge tier={row.collectorTier as CollectorTier} />
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums">
        {row.carsSold}
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums text-[hsl(var(--performance-red))]">
        {row.highestBidWonCents > 0
          ? formatCurrency(row.highestBidWonCents)
          : "—"}
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums text-emerald-500">
        {row.reputationScore}
      </td>
    </tr>
  );
}
