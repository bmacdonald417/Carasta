import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { Button } from "@/components/ui/button";
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
  if (!auction) {
    return (
      <section className="border-b border-border bg-muted/20 py-8 md:py-10">
        <div className="carasta-container">
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center shadow-e1">
            <p className="text-sm font-medium text-muted-foreground">
              No featured auction right now. Browse the marketplace for what&apos;s live.
            </p>
            <Button asChild className="mt-6 rounded-2xl">
              <Link href="/auctions">Browse auctions</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const img =
    auction.images[0]?.url ??
    "https://placehold.co/960x540/e2e8f0/64748b?text=No+image";
  const href = requireAuth
    ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auction.id}`)}`
    : `/auctions/${auction.id}`;
  const bid = highBidCents ?? 0;

  return (
    <section className="border-b border-border bg-background py-6 md:py-8">
      <div className="carasta-container">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-e2">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
            <div className="relative aspect-[16/10] w-full bg-muted lg:aspect-auto lg:min-h-[320px]">
              <Image
                src={img}
                alt={auction.title}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <div className="flex flex-col justify-center gap-5 p-6 md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Featured auction
                </p>
                <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {auction.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Live bidding on Carmunity — transparent reserve signaling, enthusiast sellers, and a feed that keeps the hobby connected to the sale.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Current bid
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-primary md:text-2xl">
                    {formatCurrency(bid)}
                  </p>
                </div>
                <div className="h-10 w-px bg-border" aria-hidden />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Time left
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
                    <CountdownTimer endAt={new Date(auction.endAt)} />
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-2xl px-7">
                  <Link href={href}>
                    View details
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl border-border bg-transparent">
                  <Link href="/auctions">Browse all</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
