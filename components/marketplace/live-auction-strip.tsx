"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AuctionCardCompact, type CompactAuction } from "@/components/marketplace/auction-card-compact";
import { cn } from "@/lib/utils";

const USER_SCROLL_COOLDOWN_MS = 4500;
/** Treat scroll events as non-user during / just after programmatic scroll. */
const PROGRAMMATIC_SCROLL_QUIET_MS = 750;

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
  const stripRef = useRef<HTMLDivElement>(null);
  const programmaticScrollQuietUntilRef = useRef(0);
  const userScrollPausedUntilRef = useRef(0);
  const [stripHover, setStripHover] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [focusWithinStrip, setFocusWithinStrip] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const stripRegionId = useId();
  const titleId = `${stripRegionId}-title`;
  const scrollRegionId = `${stripRegionId}-scroll`;

  const scrollByDir = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    programmaticScrollQuietUntilRef.current =
      Date.now() + PROGRAMMATIC_SCROLL_QUIET_MS;
    const delta = Math.min(el.clientWidth * 0.85, 520) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = stripRef.current;
    if (!node) return;
    const onFocusIn = () => setFocusWithinStrip(true);
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (!next || !node.contains(next)) setFocusWithinStrip(false);
    };
    node.addEventListener("focusin", onFocusIn);
    node.addEventListener("focusout", onFocusOut);
    return () => {
      node.removeEventListener("focusin", onFocusIn);
      node.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (Date.now() < programmaticScrollQuietUntilRef.current) return;
      userScrollPausedUntilRef.current = Date.now() + USER_SCROLL_COOLDOWN_MS;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [auctions.length]);

  useEffect(() => {
    if (!pointerActive) return;
    const end = () => setPointerActive(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [pointerActive]);

  useEffect(() => {
    if (
      auctions.length < 2 ||
      reduceMotion ||
      stripHover ||
      focusWithinStrip ||
      pointerActive
    ) {
      return;
    }
    const id = window.setInterval(() => {
      if (
        reduceMotion ||
        stripHover ||
        focusWithinStrip ||
        pointerActive ||
        Date.now() < userScrollPausedUntilRef.current
      ) {
        return;
      }
      const sc = scrollerRef.current;
      if (!sc) return;
      const maxScroll = sc.scrollWidth - sc.clientWidth;
      if (maxScroll <= 0) return;
      const step = Math.min(sc.clientWidth * 0.5, 300);
      programmaticScrollQuietUntilRef.current =
        Date.now() + PROGRAMMATIC_SCROLL_QUIET_MS;
      if (sc.scrollLeft >= maxScroll - 6) {
        sc.scrollTo({ left: 0, behavior: "auto" });
      } else {
        sc.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4200);
    return () => window.clearInterval(id);
  }, [
    auctions.length,
    reduceMotion,
    stripHover,
    focusWithinStrip,
    pointerActive,
  ]);

  if (auctions.length === 0) return null;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "border-b border-border bg-background py-2 md:py-3",
        "overflow-x-hidden",
        className
      )}
    >
      <div className="carasta-container min-w-0 max-w-full">
        <div
          ref={stripRef}
          className="relative min-w-0"
          onMouseEnter={() => setStripHover(true)}
          onMouseLeave={() => setStripHover(false)}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 px-0.5 pt-1">
            <div className="pointer-events-none flex max-w-[min(100%,18rem)] items-center gap-2 rounded-lg bg-black/45 px-2.5 py-1.5 shadow-[0_1px_12px_rgba(0,0,0,0.35)] backdrop-blur-[2px] md:max-w-none md:gap-2.5 md:px-3">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--live-accent))] opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--live-accent))]" />
              </span>
              <h2
                id={titleId}
                className="truncate text-sm font-semibold tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:text-base"
              >
                Live Auctions
              </h2>
            </div>
            <Link
              href={viewAllHref}
              className="pointer-events-auto inline-flex shrink-0 items-center gap-1 rounded-lg bg-black/45 px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_1px_12px_rgba(0,0,0,0.35)] backdrop-blur-[2px] transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 md:px-3 md:text-sm"
            >
              View All Auctions
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>

          <div className="min-w-0 pt-11 md:pt-12">
            <div className="relative min-w-0">
              <div
                ref={scrollerRef}
                id={scrollRegionId}
                className="flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-3.5 [&::-webkit-scrollbar]:hidden"
                tabIndex={0}
                aria-labelledby={titleId}
                onPointerDown={() => setPointerActive(true)}
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
                aria-label="Scroll to show more live auctions"
                aria-controls={scrollRegionId}
                className="absolute right-0 top-1/2 z-[5] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-e1 transition hover:border-primary/35 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
