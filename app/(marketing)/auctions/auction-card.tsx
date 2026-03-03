"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReserveMeter } from "@/components/auction/ReserveMeter";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { computeReserveMetPercent } from "@/lib/auction-metrics";
import { containerVariants } from "@/lib/motion";
import { useMounted } from "@/hooks";
import { URGENCY_24H_MS } from "@/lib/time";

export function AuctionCard({
  auction,
  highBidCents,
  bidCount = 0,
  index = 0,
  requireAuth = false,
}: {
  auction: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    endAt: string;
    status: string;
    reservePriceCents: number | null;
    conditionGrade?: string | null;
    images: { url: string }[];
    seller: { handle: string } | null;
  };
  highBidCents: number;
  bidCount?: number;
  index?: number;
  requireAuth?: boolean;
}) {
  const mounted = useMounted();
  const img =
    auction.images[0]?.url ??
    "https://placehold.co/600x400/1a1a1a/666?text=No+image";
  const secondaryImg = auction.images[1]?.url;
  const end = new Date(auction.endAt);
  const isLive = auction.status === "LIVE";
  const isClosingSoon =
    mounted &&
    isLive &&
    new Date(auction.endAt).getTime() - Date.now() < URGENCY_24H_MS;
  const reservePercent = computeReserveMetPercent(
    highBidCents,
    auction.reservePriceCents
  );

  const href = requireAuth ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${auction.id}`)}` : `/auctions/${auction.id}`;
  return (
    <Link href={href}>
      <motion.div
        custom={index}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="group overflow-hidden border-white/10 bg-white/5 transition-all duration-300 hover:border-[#ff3b5c]/30 hover:shadow-lg hover:shadow-[#ff3b5c]/5">
          <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
            <Image
              src={img}
              alt={auction.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {secondaryImg && (
              <Image
                src={secondaryImg}
                alt=""
                fill
                unoptimized
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
            {/* LIVE badge — futuristic pulse */}
            {isLive && (
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                <div className="live-pulse flex items-center gap-1.5 rounded-full border border-[#ff3b5c]/50 bg-[#ff3b5c]/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-[#ff3b5c]/30">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </div>
                {isClosingSoon && (
                  <div className="rounded-full border border-[#CCFF00]/50 bg-[#CCFF00]/20 px-3 py-1 text-xs font-semibold text-[#CCFF00]">
                    Closing Soon
                  </div>
                )}
              </div>
            )}
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-xl border border-white/20 bg-neutral-900/90 px-4 py-2 font-display text-sm font-semibold uppercase text-neutral-300">
                  {auction.status}
                </span>
              </div>
            )}
            {isLive && auction.conditionGrade && (
              <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-medium text-neutral-300">
                {auction.conditionGrade.replace(/_/g, " ")}
              </div>
            )}
          </div>
          <CardContent className="border-t border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
            <p className="text-xs text-neutral-500">
              {auction.year} {auction.make} {auction.model}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold tracking-tight line-clamp-1 text-neutral-100">
              {auction.title}
            </h2>
            <p className="mt-2 text-lg font-semibold text-[#ff3b5c]">
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
