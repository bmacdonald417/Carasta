"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReserveMeter } from "@/components/auction/ReserveMeter";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { getReserveMeterPercent } from "@/lib/auction-utils";

const CLOSING_SOON_MS = 24 * 60 * 60 * 1000;

export function AuctionCard({
  auction,
  highBidCents,
  bidCount = 0,
}: {
  auction: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    endAt: Date;
    status: string;
    reservePriceCents: number | null;
    images: { url: string }[];
    seller: { handle: string } | null;
  };
  highBidCents: number;
  bidCount?: number;
}) {
  const img =
    auction.images[0]?.url ??
    "https://placehold.co/600x400/1a1a1a/666?text=No+image";
  const secondaryImg = auction.images[1]?.url;
  const end = new Date(auction.endAt);
  const isLive = auction.status === "LIVE";
  const isClosingSoon =
    isLive && new Date(auction.endAt).getTime() - Date.now() < CLOSING_SOON_MS;
  const reservePercent = getReserveMeterPercent(
    highBidCents,
    auction.reservePriceCents
  );

  return (
    <Link href={`/auctions/${auction.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group overflow-hidden border-neutral-200 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/50">
          <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
            <Image
              src={img}
              alt={auction.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {secondaryImg && (
              <Image
                src={secondaryImg}
                alt=""
                fill
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
            {/* LIVE badge — pulsing */}
            {isLive && (
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </div>
                {isClosingSoon && (
                  <div className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Closing Soon
                  </div>
                )}
              </div>
            )}
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-xl bg-neutral-800 px-4 py-2 font-display text-sm font-semibold uppercase text-white">
                  {auction.status}
                </span>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">
              {auction.year} {auction.make} {auction.model}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold tracking-tight line-clamp-1 text-neutral-900">
              {auction.title}
            </h2>
            <p className="mt-2 text-lg font-semibold text-[hsl(var(--performance-red))]">
              {formatCurrency(highBidCents)}
              <span className="ml-1 text-sm font-normal text-neutral-500">
                high bid
              </span>
            </p>
            {reservePercent != null && (
              <div className="mt-3">
                <ReserveMeter
                  currentCents={highBidCents}
                  reserveCents={auction.reservePriceCents}
                />
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <CountdownTimer endAt={end} />
              <div className="flex items-center gap-3">
                <span>{bidCount} bids</span>
                <span>@{auction.seller?.handle ?? "seller"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
