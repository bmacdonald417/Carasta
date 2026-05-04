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
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[9px] font-semibold text-white/70"
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
      className={cn("inline-block h-3 w-3 shrink-0 rounded-full shadow-sm ring-2 ring-white/30", hue)}
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
        "group flex w-[200px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-e1 transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-[220px]",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={img}
          alt={auction.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
          sizes="220px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
          {headline}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          @{auction.seller?.handle ?? "seller"}
          {bidCount > 0 ? ` · ${bidCount} bid${bidCount === 1 ? "" : "s"}` : ""}
        </p>
        <p className="text-base font-semibold tabular-nums text-primary">{formatCurrency(highBidCents)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="tabular-nums">
              {mounted && auction.status === "LIVE" ? <CountdownTimer endAt={new Date(auction.endAt)} /> : "—"}
            </span>
          </span>
          <GaugeDot percent={reservePercent} />
        </div>
      </div>
    </Link>
  );
}
