"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Link
      href={href}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <motion.div
        custom={index}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="group h-full overflow-hidden border border-border bg-card shadow-e1 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none hover:border-primary/30 hover:shadow-e2">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={img}
              alt={auction.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {secondaryImg && (
              <Image
                src={secondaryImg}
                alt=""
                fill
                unoptimized
                className="object-cover opacity-0 transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
            {isLive && (
              <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                <Badge
                  variant="default"
                  className="gap-1.5 uppercase tracking-wide shadow-sm"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/90 motion-reduce:animate-none animate-pulse"
                    aria-hidden
                  />
                  Live
                </Badge>
                {isClosingSoon && (
                  <Badge
                    variant="outline"
                    className="border-caution/35 bg-caution-soft text-caution-foreground uppercase tracking-wide"
                  >
                    Ending soon
                  </Badge>
                )}
              </div>
            )}
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs uppercase tracking-wide">
                  {auction.status}
                </Badge>
              </div>
            )}
            {isLive && auction.conditionGrade && (
              <Badge
                variant="outline"
                className="absolute right-3 top-3 max-w-[min(100%,12rem)] truncate border-border/80 bg-card/95 font-medium text-muted-foreground shadow-sm backdrop-blur-sm"
              >
                {auction.conditionGrade.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          <CardContent className="border-t border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              {auction.year} {auction.make} {auction.model}
            </p>
            <h2 className="mt-1 line-clamp-1 text-lg font-semibold tracking-tight text-foreground">
              {auction.title}
            </h2>
            <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {formatCurrency(highBidCents)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <CountdownTimer endAt={end} />
              <div className="flex items-center gap-3">
                <span>{bidCount} bids</span>
                <span className="truncate">@{auction.seller?.handle ?? "seller"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
