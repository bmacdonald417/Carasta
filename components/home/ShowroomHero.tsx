"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { ReserveMeter } from "@/components/auction/ReserveMeter";
import { computeReserveMetPercent } from "@/lib/auction-metrics";
import { Badge } from "@/components/ui/badge";

type FeaturedAuction = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  endAt: Date;
  highBidCents: number;
  reservePriceCents: number | null;
  images: { url: string }[];
};

export function ShowroomHero({ auctions, requireAuth = false }: { auctions: FeaturedAuction[]; requireAuth?: boolean }) {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 25,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!emblaApi || auctions.length <= 1) return;
    const t = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(t);
  }, [emblaApi, auctions.length]);

  if (auctions.length === 0) {
    return (
      <section className="relative min-h-[50vh] bg-background">
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Built by enthusiasts, for enthusiasts.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No live auctions yet. Check back soon.
            </p>
            <Link
              href="/auctions"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse Auctions
              <Gavel className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-foreground">
      {/* Carousel */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {auctions.map((auction) => {
            const img =
              auction.images[0]?.url ??
              "https://placehold.co/1600x900/1a1a1a/666?text=No+image";
            const reservePercent = computeReserveMetPercent(
              auction.highBidCents,
              auction.reservePriceCents
            );

            const auctionHref = requireAuth ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auction.id}`)}` : `/auctions/${auction.id}`;
            return (
              <div
                key={auction.id}
                className="embla__slide relative min-w-0 flex-[0_0_100%]"
              >
                {/* Parallax-style background image — clickable */}
                <Link href={auctionHref} className="block relative aspect-[16/9] min-h-[70vh] w-full overflow-hidden md:aspect-video">
                  <Image
                    src={img}
                    alt={auction.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Overlay content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
                    <div className="carasta-container">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                      >
                        <Badge
                          variant="default"
                          className="mb-2 gap-1.5 border-0 bg-primary/95 uppercase tracking-wide text-primary-foreground shadow-md backdrop-blur-sm"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/90 motion-reduce:animate-none animate-pulse"
                            aria-hidden
                          />
                          Live
                        </Badge>
                        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
                          {auction.year} {auction.make} {auction.model}
                        </h2>
                        <p className="mt-1 text-lg text-white/90">
                          {auction.title}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-6">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-white/70">
                              Current bid
                            </p>
                            <p className="text-2xl font-semibold text-white md:text-3xl">
                              {formatCurrency(auction.highBidCents)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-white/70">
                              Time left
                            </p>
                            <CountdownTimer
                              endAt={auction.endAt}
                              variant="dark"
                              className="text-white"
                            />
                          </div>
                        </div>

                        {reservePercent != null && (
                          <div className="mt-4 max-w-xs">
                            <ReserveMeter
                              currentCents={auction.highBidCents}
                              reserveCents={auction.reservePriceCents}
                              showLabel={true}
                              variant="dark"
                            />
                          </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3">
                          <span
                            className="inline-flex w-fit items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background/90"
                          >
                            {requireAuth ? "Sign up to bid" : "Quick Bid"}
                            <Gavel className="h-4 w-4" />
                          </span>
                          {requireAuth && (
                            <div
                              className="max-w-sm space-y-2"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <details className="group">
                                <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white/90">
                                  Why register?
                                </summary>
                                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/80">
                                  <li>Place real-time bids + AutoBid</li>
                                  <li>Track bids & alerts</li>
                                  <li>Save vehicles to Garage</li>
                                </ul>
                              </details>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/how-it-works");
                                }}
                                className="text-xs text-white/70 underline underline-offset-2 hover:text-white/90"
                              >
                                Learn how bidding works
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      {auctions.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-background/10 p-2 text-background backdrop-blur-md transition hover:border-white/30 hover:bg-background/20 md:left-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-background/10 p-2 text-background backdrop-blur-md transition hover:border-white/30 hover:bg-background/20 md:right-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {auctions.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition ${
                  i === selectedIndex
                    ? "w-8 bg-background shadow-sm"
                    : "w-2 bg-background/45 hover:bg-background/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
