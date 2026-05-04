"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { computeReserveMetPercent } from "@/lib/auction-metrics";
import { useMounted } from "@/hooks";

function GaugeDot({ percent }: { percent: number | null }) {
  if (percent == null) {
    return (
      <span
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-[9px] font-semibold text-muted-foreground"
        title="Reserve status"
      >
        —
      </span>
    );
  }
  const hue =
    percent >= 100 ? "bg-[hsl(var(--reserve-emerald))]" : percent >= 70 ? "bg-caution" : "bg-[hsl(var(--performance-red))]";
  return (
    <span
      className={cn("inline-block h-3 w-3 shrink-0 rounded-full shadow-sm ring-2 ring-border/60", hue)}
      title={percent >= 100 ? "Reserve met" : `${percent}% to reserve`}
    />
  );
}

export type CompactAuction = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  endAt: string;
  status: string;
  reservePriceCents: number | null;
  images: { url: string }[];
  seller: { handle: string } | null;
};

export function AuctionCardCompact({
  auction,
  highBidCents,
  bidCount = 0,
  requireAuth = false,
  className,
}: {
  auction: CompactAuction;
  highBidCents: number;
  bidCount?: number;
  requireAuth?: boolean;
  className?: string;
}) {
  const mounted = useMounted();
  const img =
    auction.images[0]?.url ??
    "https://placehold.co/320x200/e2e8f0/64748b?text=No+image";
  const reservePercent = computeReserveMetPercent(highBidCents, auction.reservePriceCents);
  const href = requireAuth
    ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auction.id}`)}`
    : `/auctions/${auction.id}`;
  const headline = `${auction.year} ${auction.make} ${auction.model}`.toUpperCase();

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-[104px] w-[min(46vw,200px)] max-w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-muted shadow-e1 transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-[108px] sm:w-[220px]",
        className
      )}
    >
      <Image
        src={img}
        alt={auction.title}
        fill
        unoptimized
        className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
        sizes="220px"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/45 to-black/15"
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-2.5">
        <p className="line-clamp-1 text-[10px] font-semibold uppercase leading-tight tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:text-[11px]">
          {headline}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[9px] leading-snug text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)] sm:text-[10px]">
          @{auction.seller?.handle ?? "seller"}
          {bidCount > 0 ? ` · ${bidCount} bid${bidCount === 1 ? "" : "s"}` : ""}
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-sm font-semibold tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:text-[15px]">
            {formatCurrency(highBidCents)}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium tabular-nums text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <Clock className="h-3 w-3 shrink-0 text-white/85" aria-hidden />
              <span className="tabular-nums">
                {mounted && auction.status === "LIVE" ? (
                  <CountdownTimer
                    endAt={new Date(auction.endAt)}
                    variant="dark"
                    className="!inline !text-[10px] !font-medium !leading-none"
                  />
                ) : (
                  "—"
                )}
              </span>
            </span>
            <GaugeDot percent={reservePercent} />
          </div>
        </div>
      </div>
    </Link>
  );
}
