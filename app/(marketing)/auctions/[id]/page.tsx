import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeCurrentBidCents, computeReserveMetPercent } from "@/lib/auction-metrics";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AuctionDetailClient } from "./auction-detail-client";
import { ShareButtons } from "@/components/ui/share-buttons";
import { getSession } from "@/lib/auth";
import { AuctionConditionReport } from "@/components/auction/AuctionConditionReport";
import { AuctionFeedbackCard } from "@/components/auction/AuctionFeedbackCard";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import { AuctionViewTracker } from "@/components/marketing/auction-view-tracker";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { AuctionDiscussPanel } from "@/components/auction/AuctionDiscussPanel";
import { DiscussionAuthorBadges } from "@/components/discussions/DiscussionAuthorBadges";
import { MessageSellerButton } from "./message-seller-button";
import {
  countAuctionDiscussionThreads,
  listAuctionDiscussionThreads,
  sumAuctionDiscussionThreadReactions,
} from "@/lib/forums/auction-discussion";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const currentUserId = (session?.user as any)?.id;

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      damageImages: true,
      seller: {
        select: {
          id: true,
          handle: true,
          name: true,
          avatarUrl: true,
          collectorTier: true,
          reputationScore: true,
          userBadges: {
            orderBy: { awardedAt: "desc" },
            take: 8,
            select: { badge: { select: { slug: true, name: true } } },
          },
          _count: { select: { forumThreads: true, forumReplies: true } },
        },
      },
      buyer: { select: { handle: true } },
      bids: {
        orderBy: { amountCents: "desc" },
        take: 20,
        include: { bidder: { select: { handle: true, collectorTier: true } } },
      },
      feedbacks: currentUserId
        ? { where: { fromUserId: currentUserId }, select: { id: true } }
        : { where: { fromUserId: "none" }, select: { id: true } },
    },
  });

  if (!auction) notFound();

  const [discussionThreads, discussionThreadCount, discussionReactionTotal] = await Promise.all([
    listAuctionDiscussionThreads(auction.id, { take: 3 }),
    countAuctionDiscussionThreads(auction.id),
    sumAuctionDiscussionThreadReactions(auction.id),
  ]);

  if (auction.status === "DRAFT") {
    const currentUserId = (session?.user as any)?.id;
    if (currentUserId !== auction.sellerId) notFound();
  }

  const highBidCents = computeCurrentBidCents(auction.bids);
  const reserveMeterPercent = computeReserveMetPercent(
    highBidCents,
    auction.reservePriceCents
  );

  const canBuyNow =
    auction.status === "LIVE" &&
    auction.buyNowPriceCents != null &&
    auction.buyNowExpiresAt != null &&
    new Date() < auction.buyNowExpiresAt;

  const marketingTrackingOn = isMarketingEnabled();

  return (
    <div className="carasta-container max-w-6xl py-8">
      <AuctionViewTracker auctionId={auction.id} enabled={marketingTrackingOn} />
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
                  className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-muted ring-1 ring-border/40"
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
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {auction.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {auction.year} {auction.make} {auction.model}
                {auction.trim ? ` ${auction.trim}` : ""}
                {auction.mileage != null ? ` · ${auction.mileage.toLocaleString()} mi` : ""}
              </p>
            </div>
            <ShareButtons
              url={`/auctions/${auction.id}`}
              title={auction.title}
              description={`${auction.year} ${auction.make} ${auction.model} — Bid on Carasta`}
              auctionId={auction.id}
              trackMarketing={marketingTrackingOn}
            />
          </div>
          {auction.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {auction.description}
            </p>
          )}
          <AuctionConditionReport
            conditionGrade={auction.conditionGrade}
            conditionSummary={auction.conditionSummary}
            imperfections={auction.imperfections}
            damageImages={auction.damageImages}
          />
          <div className="mt-8">
            <AuctionDiscussPanel
              auctionId={auction.id}
              auctionTitle={auction.title}
              threads={discussionThreads}
              threadCount={discussionThreadCount}
              threadReactionTotal={discussionReactionTotal}
              isLoggedIn={Boolean(session?.user)}
            />
          </div>
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

          {session?.user?.id && (session.user as any).id !== auction.sellerId ? (
            <MessageSellerButton auctionId={auction.id} sellerId={auction.sellerId} />
          ) : null}

          <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
            <h3 className="text-sm font-semibold text-foreground">Buyer protections</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                  •
                </span>
                <span>
                  <strong className="text-foreground">Anti-sniping.</strong>{" "}
                  Last-minute bids extend the auction clock so everyone has a fair chance.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                  •
                </span>
                <span>
                  <strong className="text-foreground">Checkout & delivery.</strong>{" "}
                  Payment and delivery coordination handled through Carasta.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                  •
                </span>
                <span>
                  <strong className="text-foreground">Seller ratings.</strong>{" "}
                  Identity checks and verification coming soon.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              <Link
                href="/how-it-works#bid"
                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                How bidding works
              </Link>
            </p>
          </div>

          {auction.status === "SOLD" &&
            auction.buyerId &&
            currentUserId &&
            (currentUserId === auction.sellerId || currentUserId === auction.buyerId) && (
              <AuctionFeedbackCard
                auctionId={auction.id}
                counterpartyHandle={
                  currentUserId === auction.buyerId
                    ? auction.seller.handle
                    : auction.buyer?.handle ?? "buyer"
                }
                userRole={currentUserId === auction.buyerId ? "buyer" : "seller"}
                hasSubmitted={
                  Array.isArray(auction.feedbacks) && auction.feedbacks.length > 0
                }
              />
            )}

          <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
            <h3 className="text-sm font-semibold text-foreground">Seller</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Same Carmunity identity as everywhere else — explore reputation and discussion history on
              their profile.
            </p>
            <Link
              href={`/u/${auction.seller.handle}`}
              className="mt-3 flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
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
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">@{auction.seller.handle}</p>
                  <ReputationBadge tier={auction.seller.collectorTier} />
                </div>
                <p className="text-sm text-muted-foreground">{auction.seller.name ?? "Seller"}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Reputation {auction.seller.reputationScore.toLocaleString()} ·{" "}
                  {auction.seller._count.forumThreads} thread
                  {auction.seller._count.forumThreads === 1 ? "" : "s"} · {auction.seller._count.forumReplies}{" "}
                  repl{auction.seller._count.forumReplies === 1 ? "y" : "ies"} in Discussions (all time)
                </p>
                <DiscussionAuthorBadges
                  className="mt-2"
                  badges={auction.seller.userBadges.map((ub) => ({
                    slug: ub.badge.slug,
                    name: ub.badge.name,
                  }))}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Bid history</h2>
        <div className="mt-4 space-y-2">
          {auction.bids.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              No bids yet. When activity starts, each increment will appear here in order.
            </p>
          ) : (
            auction.bids.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-e1"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm text-foreground">@{b.bidder.handle}</span>
                    <ReputationBadge tier={b.bidder.collectorTier} />
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(b.amountCents)}
                    </span>
                    <span className="text-xs text-muted-foreground sm:min-w-[9rem] sm:text-right">
                      {new Date(b.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
