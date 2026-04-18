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
      <Icon className="h-4 w-4 shrink-0 text-primary/85" />
      <span className="font-display text-lg font-semibold tabular-nums text-neutral-100 md:text-xl">
        {value.toLocaleString()}
      </span>
      <span className="text-sm text-neutral-500">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/5 md:gap-3 md:px-4"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 md:gap-3 md:px-4">
      {content}
    </div>
  );
}

export function HomeStatsStrip({ stats }: { stats: HomeStats }) {
  return (
    <section
      className="border-y border-white/10 bg-black/30 py-4"
      aria-label="Carasta at a glance"
    >
      <div className="carasta-container">
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-between md:gap-4">
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
      </div>
    </section>
  );
}
