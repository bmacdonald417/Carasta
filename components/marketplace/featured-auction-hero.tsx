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
      <section className="border-b border-border bg-muted/20 py-4 md:py-5">
        <div className="carasta-container">
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center shadow-e1 md:p-10">
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
    <section className="border-b border-border bg-background py-1.5 md:py-2">
      <div className="carasta-container">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-e2">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="relative h-[min(42vw,168px)] w-full bg-muted sm:h-[180px] lg:h-[min(200px,26vh)] lg:max-h-[200px]">
              <Image
                src={img}
                alt={auction.title}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 52vw"
              />
            </div>
            <div className="flex flex-col justify-center gap-2 p-3 md:gap-2.5 md:p-4 lg:p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Featured auction
                </p>
                <h2 className="mt-1.5 font-serif text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl lg:text-2xl">
                  {auction.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                  Live bidding on Carmunity — transparent reserve signaling, enthusiast sellers, and a feed that keeps the hobby connected to the sale.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 md:gap-4 md:px-3.5 md:py-2">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Current bid
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-primary md:text-xl">
                    {formatCurrency(bid)}
                  </p>
                </div>
                <div className="h-8 w-px bg-border md:h-9" aria-hidden />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Time left
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-foreground tabular-nums md:text-sm">
                    <CountdownTimer endAt={new Date(auction.endAt)} />
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <Button asChild size="sm" className="rounded-lg px-4 md:px-5">
                  <Link href={href}>
                    View details
                    <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg border-border bg-transparent">
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
