import Link from "next/link";
import type { ComponentType } from "react";
import { Gavel, CheckCircle, MessageSquare, FileText } from "lucide-react";
import type { HomeStats } from "@/lib/home-stats";

function StatItem({
  icon: Icon,
  value,
  label,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-lg font-semibold tabular-nums text-foreground md:text-xl">
        {value.toLocaleString()}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm transition-colors hover:border-primary/25 hover:bg-muted/30 md:gap-3 md:px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm md:gap-3 md:px-4">
      {content}
    </div>
  );
}

export function HomeStatsStrip({ stats }: { stats: HomeStats }) {
  return (
    <section aria-label="Carasta at a glance">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatItem
          icon={Gavel}
          value={stats.liveAuctions}
          label="Live auctions"
          href="/auctions"
        />
        <StatItem
          icon={CheckCircle}
          value={stats.soldAuctions}
          label="Completed sales"
        />
        <StatItem
          icon={MessageSquare}
          value={stats.totalBids}
          label="Bids placed"
        />
        <StatItem
          icon={FileText}
          value={stats.communityPosts}
          label="Carmunity posts"
          href="/explore"
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Marketplace motion and community activity belong in the same story, so
        these signals now support the homepage instead of trying to act like the
        homepage.
      </p>
    </section>
  );
}
