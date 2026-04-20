import type { ForumServiceError, ForumServiceOk } from "@/lib/forums/forum-service";
import { prisma } from "@/lib/db";
import {
  AUCTION_DISCUSSION_CATEGORY_SLUG,
  AUCTION_DISCUSSION_SPACE_SLUG,
} from "@/lib/forums/auction-discussion-constants";

export type AuctionDiscussionThreadRow = {
  id: string;
  title: string;
  replyCount: number;
  lastActivityAt: Date;
  gearSlug: string;
  lowerGearSlug: string;
  reactionCount: number;
};

export async function getAuctionDiscussionCategoryId(): Promise<string | null> {
  const row = await prisma.forumCategory.findFirst({
    where: {
      slug: AUCTION_DISCUSSION_CATEGORY_SLUG,
      space: { slug: AUCTION_DISCUSSION_SPACE_SLUG, isActive: true },
    },
    select: { id: true },
  });
  return row?.id ?? null;
}

export async function countAuctionDiscussionThreads(auctionId: string): Promise<number> {
  return prisma.forumThread.count({
    where: { auctionId, isHidden: false },
  });
}

export async function listAuctionDiscussionThreads(
  auctionId: string,
  input?: { take?: number }
): Promise<AuctionDiscussionThreadRow[]> {
  const take = Math.min(Math.max(input?.take ?? 3, 1), 5);
  const rows = await prisma.forumThread.findMany({
    where: { auctionId, isHidden: false },
    orderBy: { lastActivityAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      replyCount: true,
      lastActivityAt: true,
      category: { select: { slug: true, space: { select: { slug: true } } } },
      _count: { select: { threadReactions: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    replyCount: r.replyCount,
    lastActivityAt: r.lastActivityAt,
    gearSlug: r.category.space.slug,
    lowerGearSlug: r.category.slug,
    reactionCount: r._count.threadReactions,
  }));
}

/** Aggregate thread reactions for all non-hidden threads linked to an auction (real count only). */
export async function sumAuctionDiscussionThreadReactions(auctionId: string): Promise<number> {
  const agg = await prisma.forumThreadReaction.aggregate({
    where: { thread: { auctionId, isHidden: false } },
    _count: { _all: true },
  });
  return agg._count._all;
}

export async function viewerCanSeeAuctionForDiscussion(input: {
  auction: { id: string; status: string; sellerId: string };
  viewerUserId: string | null;
}): Promise<boolean> {
  const { auction, viewerUserId } = input;
  if (auction.status === "DRAFT") {
    return viewerUserId === auction.sellerId;
  }
  return true;
}

/**
 * Creates a thread in the listings-auctions taxonomy and links it to the auction.
 * Not exposed on generic forum create — use POST /api/auctions/[id]/discussion-thread.
 */
export async function createAuctionDiscussionThread(input: {
  authorId: string;
  auctionId: string;
  title: string;
  body: string;
}): Promise<ForumServiceOk<{ threadId: string }> | ForumServiceError> {
  const categoryId = await getAuctionDiscussionCategoryId();
  if (!categoryId) {
    return {
      ok: false,
      error:
        "Discussion space is not configured yet. Run `npx prisma db seed` (or ensure listings-auctions exists).",
    };
  }

  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (!body) return { ok: false, error: "Body is required." };

  const auction = await prisma.auction.findUnique({
    where: { id: input.auctionId },
    select: { id: true, status: true, sellerId: true },
  });
  if (!auction) return { ok: false, error: "Auction not found." };
  if (!(await viewerCanSeeAuctionForDiscussion({ auction, viewerUserId: input.authorId }))) {
    return { ok: false, error: "You can’t start a discussion for this listing." };
  }

  const thread = await prisma.forumThread.create({
    data: {
      categoryId,
      authorId: input.authorId,
      auctionId: auction.id,
      title,
      body,
      replyCount: 0,
      lastActivityAt: new Date(),
    },
    select: { id: true },
  });

  return { ok: true, threadId: thread.id };
}

export type DiscussedLiveAuctionRow = {
  auctionId: string;
  title: string;
  year: number;
  make: string;
  model: string;
  imageUrl: string | null;
  status: string;
  endAt: Date;
  threadCount: number;
  lastDiscussedAt: Date;
};

/**
 * LIVE auctions with recent linked discussion (for Explore crossover — capped, real counts).
 */
export async function listDiscussedLiveAuctions(input?: { take?: number }): Promise<DiscussedLiveAuctionRow[]> {
  const take = Math.min(Math.max(input?.take ?? 3, 1), 6);
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const threads = await prisma.forumThread.findMany({
    where: {
      isHidden: false,
      auctionId: { not: null },
      lastActivityAt: { gte: since },
      auction: { status: "LIVE", endAt: { gt: new Date() } },
    },
    orderBy: { lastActivityAt: "desc" },
    take: 80,
    select: {
      auctionId: true,
      lastActivityAt: true,
      auction: {
        select: {
          id: true,
          title: true,
          year: true,
          make: true,
          model: true,
          status: true,
          endAt: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  const seen = new Set<string>();
  const out: DiscussedLiveAuctionRow[] = [];

  for (const t of threads) {
    if (!t.auctionId || !t.auction) continue;
    if (seen.has(t.auction.id)) continue;
    seen.add(t.auction.id);
    const a = t.auction;
    out.push({
      auctionId: a.id,
      title: a.title,
      year: a.year,
      make: a.make,
      model: a.model,
      imageUrl: a.images[0]?.url ?? null,
      status: a.status,
      endAt: a.endAt,
      threadCount: 1,
      lastDiscussedAt: t.lastActivityAt,
    });
    if (out.length >= take) break;
  }

  if (out.length === 0) return [];
  const ids = out.map((o) => o.auctionId);
  const counts = await prisma.forumThread.groupBy({
    by: ["auctionId"],
    where: { auctionId: { in: ids }, isHidden: false },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.auctionId as string, c._count._all]));
  return out.map((o) => ({
    ...o,
    threadCount: countMap.get(o.auctionId) ?? 1,
  }));
}
