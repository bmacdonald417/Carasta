"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AuctionCardCompact, type CompactAuction } from "@/components/marketplace/auction-card-compact";
import { cn } from "@/lib/utils";

export function LiveAuctionStrip({
  auctions,
  requireAuth = false,
  viewAllHref = "/auctions",
  className,
}: {
  auctions: Array<
    CompactAuction & {
      highBidCents: number;
      _count?: { bids: number };
    }
  >;
  requireAuth?: boolean;
  viewAllHref?: string;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.min(el.clientWidth * 0.85, 520) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  if (auctions.length === 0) return null;

  return (
    <section
      className={cn(
        "border-b border-border bg-background py-4 md:py-5",
        className
      )}
    >
      <div className="carasta-container">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--live-accent))] opacity-40 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--live-accent))]" />
            </span>
            <h2 className="truncate text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Live Auctions
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary/90"
          >
            View All Auctions
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="relative mt-4">
          <div
            ref={scrollerRef}
            className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            aria-label="Live auctions"
          >
            {auctions.map((a) => (
              <AuctionCardCompact
                key={a.id}
                auction={a}
                highBidCents={a.highBidCents}
                bidCount={a._count?.bids ?? 0}
                requireAuth={requireAuth}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-[1] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-e1 transition hover:border-primary/35 hover:bg-muted/40 md:inline-flex"
            aria-label="Scroll auctions right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
