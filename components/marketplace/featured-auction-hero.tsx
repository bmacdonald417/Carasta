import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import type { CompactAuction } from "@/components/marketplace/auction-card-compact";

export function FeaturedAuctionHero({
  auction,
  highBidCents,
  requireAuth = false,
}: {
  auction: CompactAuction | null;
  highBidCents: number | null;
  requireAuth?: boolean;
}) {
  if (!auction) return null;

  const img = auction.images[0]?.url ?? null;
  const href = requireAuth
    ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auction.id}`)}`
    : `/auctions/${auction.id}`;
  const bid = highBidCents ?? 0;

  return (
    <div className="border-b border-border bg-background px-4 py-2 md:px-6">
      <div className="carasta-container px-0">
        <div className="overflow-hidden rounded-xl border border-primary/30 bg-accent/30 shadow-e1">
          <div className="flex items-center gap-0">
            {/* Compact image thumbnail */}
            {img && (
              <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden bg-muted sm:h-[80px] sm:w-[120px]">
                <Image
                  src={img}
                  alt={auction.title}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                  sizes="120px"
                />
              </div>
            )}
            {/* Body */}
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 md:px-4">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Featured auction
                </span>
                <h2 className="truncate text-sm font-semibold text-foreground md:text-base">
                  {auction.title}
                </h2>
              </div>
              {/* Bid + timer */}
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Current bid</p>
                  <p className="text-base font-bold tabular-nums text-primary md:text-lg">{formatCurrency(bid)}</p>
                </div>
                <div className="h-8 w-px bg-border" aria-hidden />
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Time left</p>
                  <p className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-foreground">
                    <Clock className="h-3 w-3 text-muted-foreground" aria-hidden />
                    <CountdownTimer endAt={new Date(auction.endAt)} />
                  </p>
                </div>
                <Link
                  href={href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  View details
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
