"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AuctionsMapInner } from "./AuctionsMapInner";

export type AuctionForMap = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  status: string;
  reservePriceCents: number | null;
  latitude: number;
  longitude: number;
  images: { url: string }[];
  seller: { handle: string } | null;
  highBidCents: number;
  bidCount: number;
};

type Props = {
  auctions: AuctionForMap[];
  requireAuth: boolean;
};

export function AuctionsMapView({ auctions, requireAuth }: Props) {
  if (auctions.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
        <p className="text-muted-foreground">No auctions with location to show on map.</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-border/50">
      <AuctionsMapInner auctions={auctions} requireAuth={requireAuth} />
    </div>
  );
}

export function AuctionMapPreview({
  auction,
  highBidCents,
  bidCount,
  requireAuth,
}: {
  auction: AuctionForMap;
  highBidCents: number;
  bidCount: number;
  requireAuth: boolean;
}) {
  const href = requireAuth
    ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auction.id}`)}`
    : `/auctions/${auction.id}`;
  const img = auction.images[0]?.url ?? "https://placehold.co/200x120/1a1a1a/666?text=No+image";

  return (
    <div className="min-w-[200px] max-w-[260px] overflow-hidden rounded-lg border border-border/50 bg-card/80 shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img src={img} alt={auction.title} className="h-full w-full object-cover" />
        {auction.status === "LIVE" && (
          <span className="absolute left-2 top-2 rounded bg-signal px-2 py-0.5 text-xs font-medium text-white">
            Live
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">
          {auction.year} {auction.make} {auction.model}
        </p>
        <p className="mt-0.5 font-medium line-clamp-1">{auction.title}</p>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatCurrency(highBidCents)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {bidCount} bids · @{auction.seller?.handle ?? "seller"}
        </p>
        <Link
          href={href}
          className="mt-2 block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground shadow-e1 hover:bg-primary/90 hover:shadow-e2"
        >
          View auction
        </Link>
      </div>
    </div>
  );
}
