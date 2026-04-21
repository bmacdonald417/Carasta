import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/utils";

export function DiscussionAuctionContextCard({
  auction,
}: {
  auction: {
    id: string;
    title: string;
    status: string;
    endAt: string;
    year: number;
    make: string;
    model: string;
    leadImageUrl: string | null;
    highBidCents: number;
    reservePriceCents: number | null;
  };
}) {
  const isLive = auction.status === "LIVE" && new Date(auction.endAt) > new Date();
  const bidLine =
    auction.highBidCents > 0
      ? `High bid ${formatCurrency(auction.highBidCents)}`
      : "No bids yet";
  const reserveLine =
    auction.reservePriceCents != null && auction.reservePriceCents > 0
      ? `Reserve ${formatCurrency(auction.reservePriceCents)}`
      : null;

  return (
    <aside className="rounded-2xl border border-border bg-card p-4 shadow-e1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Listing context
      </p>
      <div className="mt-3 flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {auction.leadImageUrl ? (
            <Image
              src={auction.leadImageUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              No photo
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/auctions/${auction.id}`}
            className="text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {auction.title}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {auction.year} {auction.make} {auction.model}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {bidLine}
            {reserveLine ? (
              <>
                <span className="text-muted-foreground/50"> · </span>
                {reserveLine}
              </>
            ) : null}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {isLive ? (
              <span className="text-signal">Live auction</span>
            ) : (
              <span>Status: {auction.status}</span>
            )}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Link
          href={`/auctions/${auction.id}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View listing →
        </Link>
      </div>
    </aside>
  );
}
