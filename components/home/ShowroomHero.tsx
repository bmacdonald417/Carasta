"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { ReserveMeter } from "@/components/auction/ReserveMeter";
import { getReserveMeterPercent } from "@/lib/auction-utils";

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

export function ShowroomHero({ auctions }: { auctions: FeaturedAuction[] }) {
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
      <section className="relative min-h-[70vh] bg-neutral-100">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl">
              Built by Enthusiasts, for Enthusiasts.
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              No live auctions yet. Check back soon.
            </p>
            <Link
              href="/auctions"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-800"
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
    <section className="relative min-h-[70vh] overflow-hidden bg-neutral-950">
      {/* Carousel */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {auctions.map((auction) => {
            const img =
              auction.images[0]?.url ??
              "https://placehold.co/1600x900/1a1a1a/666?text=No+image";
            const reservePercent = getReserveMeterPercent(
              auction.highBidCents,
              auction.reservePriceCents
            );

            return (
              <div
                key={auction.id}
                className="embla__slide relative min-w-0 flex-[0_0_100%]"
              >
                {/* Parallax-style background image */}
                <div className="relative aspect-[16/9] min-h-[70vh] w-full overflow-hidden md:aspect-video">
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
                        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                          Live
                        </span>
                        <h2 className="font-display text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
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

                        <Link
                          href={`/auctions/${auction.id}`}
                          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-100"
                        >
                          Quick Bid
                          <Gavel className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
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
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 md:left-6"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 md:right-6"
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
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
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
