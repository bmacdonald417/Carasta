import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getReserveMeterPercent } from "@/lib/auction-utils";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AuctionDetailClient } from "./auction-detail-client";
import { ShareButtons } from "@/components/ui/share-buttons";
import { getSession } from "@/lib/auth";
import { AuctionConditionReport } from "@/components/auction/AuctionConditionReport";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      damageImages: true,
      seller: { select: { id: true, handle: true, name: true, avatarUrl: true } },
      bids: {
        orderBy: { amountCents: "desc" },
        take: 20,
        include: { bidder: { select: { handle: true } } },
      },
    },
  });

  if (!auction) notFound();

  if (auction.status === "DRAFT") {
    const currentUserId = (session?.user as any)?.id;
    if (currentUserId !== auction.sellerId) notFound();
  }

  const highBidCents = auction.bids[0]?.amountCents ?? 0;
  const reserveMeterPercent = getReserveMeterPercent(
    highBidCents,
    auction.reservePriceCents
  );

  const canBuyNow =
    auction.status === "LIVE" &&
    auction.buyNowPriceCents != null &&
    auction.buyNowExpiresAt != null &&
    new Date() < auction.buyNowExpiresAt;

  return (
    <div className="carasta-container max-w-6xl py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
            {auction.images.length > 0 ? (
              <Image
                src={auction.images[0].url}
                alt={auction.title}
                fill
                unoptimized
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {auction.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {auction.images.slice(1, 6).map((img) => (
                <div
                  key={img.id}
                  className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl text-neutral-100">
                {auction.title}
              </h1>
              <p className="mt-1 text-neutral-400">
                {auction.year} {auction.make} {auction.model}
                {auction.trim ? ` ${auction.trim}` : ""}
                {auction.mileage != null ? ` · ${auction.mileage.toLocaleString()} mi` : ""}
              </p>
            </div>
            <ShareButtons
              url={`/auctions/${auction.id}`}
              title={auction.title}
              description={`${auction.year} ${auction.make} ${auction.model} — Bid on Carasta`}
            />
          </div>
          {auction.description && (
            <p className="mt-4 text-sm text-neutral-400 whitespace-pre-wrap">
              {auction.description}
            </p>
          )}
          <AuctionConditionReport
            conditionGrade={auction.conditionGrade}
            conditionSummary={auction.conditionSummary}
            imperfections={auction.imperfections}
            damageImages={auction.damageImages}
          />
        </div>

        <div className="space-y-6">
          <AuctionDetailClient
            auctionId={auction.id}
            status={auction.status}
            endAt={auction.endAt.toISOString()}
            highBidCents={highBidCents}
            highBidderHandle={auction.bids[0]?.bidder?.handle ?? null}
            reserveMeterPercent={reserveMeterPercent}
            hasReserve={auction.reservePriceCents != null && auction.reservePriceCents > 0}
            buyNowPriceCents={canBuyNow ? auction.buyNowPriceCents! : null}
            buyNowExpiresAt={auction.buyNowExpiresAt?.toISOString() ?? null}
            nextMinBidCents={highBidCents + 25000}
            isLoggedIn={!!session?.user}
            currentUserHandle={(session?.user as any)?.handle ?? null}
          />

          <div className="rounded-2xl border border-border/50 bg-card/80 p-4">
            <h3 className="font-display font-semibold">Seller</h3>
            <Link
              href={`/u/${auction.seller.handle}`}
              className="mt-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {auction.seller.avatarUrl ? (
                  <Image
                    src={auction.seller.avatarUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="font-medium">@{auction.seller.handle}</p>
                <p className="text-sm text-muted-foreground">
                  {auction.seller.name ?? "Seller"}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold">Bid history</h2>
        <div className="mt-4 space-y-2">
          {auction.bids.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bids yet.</p>
          ) : (
            auction.bids.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-2"
              >
                <span className="text-sm">@{b.bidder.handle}</span>
                <span className="font-medium text-[hsl(var(--performance-red))]">
                  {formatCurrency(b.amountCents)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(b.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
