import Link from "next/link";
import { Gavel, CheckCircle, MessageSquare, FileText } from "lucide-react";
import type { HomeStats } from "@/lib/home-stats";

function StatItem({
  icon: Icon,
  value,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="font-display text-lg font-semibold tabular-nums text-neutral-950 md:text-xl">
        {value.toLocaleString()}
      </span>
      <span className="text-sm text-neutral-600">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 md:gap-3 md:px-4"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm md:gap-3 md:px-4">
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
      <p className="mt-4 text-sm leading-6 text-neutral-600">
        Marketplace motion and community activity belong in the same story, so
        these signals now support the homepage instead of trying to act like the
        homepage.
      </p>
    </section>
  );
}
