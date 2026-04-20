import type { DiscussionReactionKind } from "@prisma/client";

import { extractMentionHandles } from "@/lib/discussions/mentions";
import {
  countThreadsInCategory,
  countThreadsInCategoryTopWindow,
  listRankedThreadIdsForCategory,
  type ThreadListSort,
  type ThreadVisibilityContext,
} from "@/lib/forums/discussion-ranking-queries";
import { listBlockedUserIdsForBlocker, viewerBlocksUserId } from "@/lib/user-safety";
import { prisma } from "@/lib/db";
import {
  notifyMention,
  notifyReplyToReply,
  notifyThreadReply,
} from "@/lib/notifications/carmunity-discussion-notifications";
import { notifySubscribedThreadNewReply } from "@/lib/notifications/carmunity-retention-notifications";

export type ForumServiceError = { ok: false; error: string };
export type ForumServiceOk<T extends object> = { ok: true } & T;

export type DiscussionReactionTotals = {
  total: number;
  byKind: Partial<Record<DiscussionReactionKind, number>>;
};

export type DiscussionSortMode = "trending" | "new" | "top";

const authorSelect = {
  id: true,
  handle: true,
  name: true,
  avatarUrl: true,
} as const;

const authorWithBadgesSelect = {
  id: true,
  handle: true,
  name: true,
  avatarUrl: true,
  userBadges: {
    orderBy: { awardedAt: "desc" as const },
    take: 6,
    select: {
      badge: { select: { slug: true, name: true } },
    },
  },
} as const;

function emptyReactionSummary(): DiscussionReactionTotals {
  return { total: 0, byKind: {} };
}

async function resolveThreadVisibility(input: {
  viewerUserId?: string | null;
  viewerIsAdmin?: boolean;
}): Promise<ThreadVisibilityContext> {
  if (input.viewerIsAdmin) {
    return { viewerIsAdmin: true, blockedAuthorIds: [] };
  }
  if (!input.viewerUserId) {
    return { viewerIsAdmin: false, blockedAuthorIds: [] };
  }
  const blockedAuthorIds = await listBlockedUserIdsForBlocker(prisma, input.viewerUserId);
  return { viewerIsAdmin: false, blockedAuthorIds };
}

async function summarizeThreadReactionsForMany(
  threadIds: string[]
): Promise<Map<string, DiscussionReactionTotals>> {
  const map = new Map<string, DiscussionReactionTotals>();
  if (threadIds.length === 0) return map;
  for (const id of threadIds) map.set(id, emptyReactionSummary());
  const rows = await prisma.forumThreadReaction.groupBy({
    by: ["threadId", "kind"],
    where: { threadId: { in: threadIds } },
    _count: { _all: true },
  });
  for (const row of rows) {
    const cur = map.get(row.threadId) ?? emptyReactionSummary();
    cur.byKind[row.kind] = (cur.byKind[row.kind] ?? 0) + row._count._all;
    cur.total += row._count._all;
    map.set(row.threadId, cur);
  }
  return map;
}

async function summarizeReplyReactionsForMany(
  replyIds: string[]
): Promise<Map<string, DiscussionReactionTotals>> {
  const map = new Map<string, DiscussionReactionTotals>();
  if (replyIds.length === 0) return map;
  for (const id of replyIds) map.set(id, emptyReactionSummary());
  const rows = await prisma.forumReplyReaction.groupBy({
    by: ["replyId", "kind"],
    where: { replyId: { in: replyIds } },
    _count: { _all: true },
  });
  for (const row of rows) {
    const cur = map.get(row.replyId) ?? emptyReactionSummary();
    cur.byKind[row.kind] = (cur.byKind[row.kind] ?? 0) + row._count._all;
    cur.total += row._count._all;
    map.set(row.replyId, cur);
  }
  return map;
}

export async function listForumSpaces(): Promise<
  ForumServiceOk<{
    spaces: Array<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      sortOrder: number;
      categoryCount: number;
    }>;
  }>
> {
  const rows = await prisma.forumSpace.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { categories: true } },
    },
  });
  return {
    ok: true,
    spaces: rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      sortOrder: s.sortOrder,
      categoryCount: s._count.categories,
    })),
  };
}

/** @deprecated Use `getLowerGearBySlugs` in new code — same resolver (ForumCategory). */
export async function getForumCategoryBySpaceAndCategorySlug(
  gearSlug: string,
  lowerGearSlug: string
): Promise<
  ForumServiceOk<{
    category: {
      id: string;
      slug: string;
      title: string;
      description: string | null;
      sortOrder: number;
      space: { id: string; slug: string; title: string; description: string | null };
    };
  }> | { ok: false; error: string }
> {
  const row = await prisma.forumCategory.findFirst({
    where: {
      slug: lowerGearSlug,
      space: { slug: gearSlug, isActive: true },
    },
    include: {
      space: { select: { id: true, slug: true, title: true, description: true } },
    },
  });
  if (!row) {
    return { ok: false, error: "Lower Gear not found." };
  }
  return {
    ok: true,
    category: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      sortOrder: row.sortOrder,
      space: row.space,
    },
  };
}

/** Resolve Lower Gear (ForumCategory) within a Gear (ForumSpace) by public slugs. */
export const getLowerGearBySlugs = getForumCategoryBySpaceAndCategorySlug;

export async function getForumSpaceBySlug(slug: string): Promise<
  ForumServiceOk<{
    space: {
      id: string;
      slug: string;
      title: string;
      description: string | null;
      sortOrder: number;
      categories: Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        sortOrder: number;
        threadCount: number;
        metadata: unknown;
      }>;
    };
  }> | { ok: false; error: string }
> {
  const space = await prisma.forumSpace.findFirst({
    where: { slug, isActive: true },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { threads: true } },
        },
      },
    },
  });
  if (!space) {
    return { ok: false, error: "Gear not found." };
  }
  return {
    ok: true,
    space: {
      id: space.id,
      slug: space.slug,
      title: space.title,
      description: space.description,
      sortOrder: space.sortOrder,
      categories: space.categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        sortOrder: c.sortOrder,
        threadCount: c._count.threads,
        metadata: c.metadata ?? null,
      })),
    },
  };
}

export async function listRecentThreadsForGear(input: {
  spaceId: string;
  take?: number;
  viewerUserId?: string | null;
  viewerIsAdmin?: boolean;
}): Promise<
  ForumServiceOk<{
    threads: Array<{
      id: string;
      title: string;
      replyCount: number;
      lastActivityAt: string;
      createdAt: string;
      demoSeed: boolean;
      reactionSummary: DiscussionReactionTotals;
      category: { slug: string; gearSlug: string };
      author: { id: string; handle: string; name: string | null; avatarUrl: string | null };
    }>;
  }>
> {
  const take = Math.min(Math.max(input.take ?? 12, 1), 30);
  const visibility = await resolveThreadVisibility({
    viewerUserId: input.viewerUserId ?? null,
    viewerIsAdmin: input.viewerIsAdmin,
  });
  const threads = await prisma.forumThread.findMany({
    where: {
      category: { spaceId: input.spaceId },
      ...(visibility.viewerIsAdmin
        ? {}
        : {
            isHidden: false,
            ...(visibility.blockedAuthorIds.length
              ? { authorId: { notIn: visibility.blockedAuthorIds } }
              : {}),
          }),
    },
    orderBy: { lastActivityAt: "desc" },
    take,
    include: {
      author: { select: authorSelect },
      category: { select: { slug: true, space: { select: { slug: true } } } },
    },
  });
  const ids = threads.map((t) => t.id);
  const rx = await summarizeThreadReactionsForMany(ids);
  return {
    ok: true,
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      replyCount: t.replyCount,
      lastActivityAt: t.lastActivityAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
      demoSeed: t.isDemoSeed,
      reactionSummary: rx.get(t.id) ?? emptyReactionSummary(),
      category: { slug: t.category.slug, gearSlug: t.category.space.slug },
      author: {
        id: t.author.id,
        handle: t.author.handle,
        name: t.author.name,
        avatarUrl: t.author.avatarUrl,
      },
    })),
  };
}

async function countThreadsForCategorySort(
  categoryId: string,
  sort: DiscussionSortMode,
  visibility: ThreadVisibilityContext
): Promise<number> {
  if (sort === "top") {
    return countThreadsInCategoryTopWindow(categoryId, visibility);
  }
  return countThreadsInCategory(categoryId, visibility);
}

export async function listThreadsForCategory(input: {
  categoryId: string;
  page?: number;
  take?: number;
  sort?: DiscussionSortMode;
  viewerUserId?: string | null;
  viewerIsAdmin?: boolean;
}): Promise<
  ForumServiceOk<{
    threads: Array<{
      id: string;
      title: string;
      replyCount: number;
      lastActivityAt: string;
      createdAt: string;
      demoSeed: boolean;
      reactionSummary: DiscussionReactionTotals;
      author: { id: string; handle: string; name: string | null; avatarUrl: string | null };
    }>;
    page: number;
    hasNextPage: boolean;
    totalCount: number;
  }> | { ok: false; error: string }
> {
  const take = Math.min(Math.max(input.take ?? 20, 1), 50);
  const page = Math.max(1, input.page ?? 1);
  const sort: DiscussionSortMode = input.sort ?? "trending";
  const cat = await prisma.forumCategory.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!cat) {
    return { ok: false, error: "Category not found." };
  }

  const skip = (page - 1) * take;
  const sortKey = sort as ThreadListSort;
  const visibility = await resolveThreadVisibility({
    viewerUserId: input.viewerUserId ?? null,
    viewerIsAdmin: input.viewerIsAdmin,
  });
  const ids = await listRankedThreadIdsForCategory({
    categoryId: input.categoryId,
    sort: sortKey,
    skip,
    take: take + 1,
    visibility,
  });
  const hasNextPage = ids.length > take;
  const sliceIds = hasNextPage ? ids.slice(0, take) : ids;

  const [rows, totalCount] = await Promise.all([
    sliceIds.length
      ? prisma.forumThread.findMany({
          where: { id: { in: sliceIds } },
          include: { author: { select: authorSelect } },
        })
      : Promise.resolve([]),
    countThreadsForCategorySort(input.categoryId, sort, visibility),
  ]);

  const byId = new Map(rows.map((t) => [t.id, t] as const));
  const ordered = sliceIds.map((id) => byId.get(id)).filter(Boolean) as NonNullable<
    (typeof rows)[number]
  >[];

  const rx = await summarizeThreadReactionsForMany(ordered.map((t) => t.id));

  return {
    ok: true,
    threads: ordered.map((t) => ({
      id: t.id,
      title: t.title,
      replyCount: t.replyCount,
      lastActivityAt: t.lastActivityAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
      demoSeed: t.isDemoSeed,
      reactionSummary: rx.get(t.id) ?? emptyReactionSummary(),
      author: {
        id: t.author.id,
        handle: t.author.handle,
        name: t.author.name,
        avatarUrl: t.author.avatarUrl,
      },
    })),
    page,
    hasNextPage,
    totalCount,
  };
}

export type ForumReplyListRow = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  demoSeed: boolean;
  /** Moderation hide or viewer block — UI shows placeholder instead of body. */
  contentWithdrawn: boolean;
  reactionSummary: DiscussionReactionTotals;
  viewerReactionKind: DiscussionReactionKind | null;
  author: { id: string; handle: string; name: string | null; avatarUrl: string | null };
};

export async function listForumRepliesPage(input: {
  threadId: string;
  take?: number;
  cursorId?: string | null;
  viewerUserId?: string | null;
  viewerIsAdmin?: boolean;
}): Promise<{
  replies: ForumReplyListRow[];
  nextCursor: string | null;
}> {
  const take = Math.min(Math.max(input.take ?? 40, 1), 80);
  const replies = await prisma.forumReply.findMany({
    where: { threadId: input.threadId },
    orderBy: { createdAt: "asc" },
    take: take + 1,
    ...(input.cursorId
      ? {
          skip: 1,
          cursor: { id: input.cursorId },
        }
      : {}),
    include: {
      author: { select: authorSelect },
    },
  });

  const hasMore = replies.length > take;
  const slice = hasMore ? replies.slice(0, take) : replies;
  const nextCursor = hasMore ? slice[slice.length - 1]!.id : null;
  const replyIds = slice.map((r) => r.id);
  const repliesRx =
    replyIds.length > 0 ? await summarizeReplyReactionsForMany(replyIds) : new Map();
  const viewerReplyRows =
    input.viewerUserId && replyIds.length
      ? await prisma.forumReplyReaction.findMany({
          where: { userId: input.viewerUserId, replyId: { in: replyIds } },
          select: { replyId: true, kind: true },
        })
      : [];
  const viewerReplyKindById = new Map(
    viewerReplyRows.map((row) => [row.replyId, row.kind] as const)
  );

  const blockedAuthorIds =
    input.viewerUserId && !input.viewerIsAdmin
      ? await listBlockedUserIdsForBlocker(prisma, input.viewerUserId)
      : [];
  const blocked = new Set(blockedAuthorIds);

  return {
    replies: slice.map((r) => {
      const contentWithdrawn = Boolean(
        !input.viewerIsAdmin && (r.isHidden || blocked.has(r.author.id))
      );
      return {
        id: r.id,
        authorId: r.author.id,
        body: contentWithdrawn ? "" : r.body,
        createdAt: r.createdAt.toISOString(),
        demoSeed: r.isDemoSeed,
        contentWithdrawn,
        reactionSummary: repliesRx.get(r.id) ?? emptyReactionSummary(),
        viewerReactionKind: viewerReplyKindById.get(r.id) ?? null,
        author: {
          id: r.author.id,
          handle: r.author.handle,
          name: r.author.name,
          avatarUrl: r.author.avatarUrl,
        },
      };
    }),
    nextCursor,
  };
}

export type GetForumThreadDetailOptions = {
  viewerUserId?: string | null;
  viewerIsAdmin?: boolean;
  replies?: { take?: number; cursorId?: string | null };
};

export async function getForumThreadDetail(
  threadId: string,
  opts?: GetForumThreadDetailOptions
): Promise<
  ForumServiceOk<{
    thread: {
      id: string;
      title: string;
      body: string;
      replyCount: number;
      locked: boolean;
      lastActivityAt: string;
      createdAt: string;
      category: {
        id: string;
        slug: string;
        title: string;
        space: { id: string; slug: string; title: string };
      };
      auction: null | {
        id: string;
        title: string;
        status: string;
        endAt: string;
        year: number;
        make: string;
        model: string;
        leadImageUrl: string | null;
        highBidCents: number;
        reservePriceCents: number | null;
      };
      author: {
        id: string;
        handle: string;
        name: string | null;
        avatarUrl: string | null;
        badges: Array<{ slug: string; name: string }>;
      };
      demoSeed: boolean;
      reactionSummary: DiscussionReactionTotals;
      viewerReactionKind: DiscussionReactionKind | null;
      replies: ForumReplyListRow[];
      repliesNextCursor: string | null;
    };
  }> | null
> {
  const viewerUserId = opts?.viewerUserId ?? null;
  const viewerIsAdmin = Boolean(opts?.viewerIsAdmin);
  const repliesPagination = opts?.replies;

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: { select: authorWithBadgesSelect },
      category: {
        select: {
          id: true,
          slug: true,
          title: true,
          space: { select: { id: true, slug: true, title: true } },
        },
      },
      auction: {
        select: {
          id: true,
          title: true,
          status: true,
          endAt: true,
          year: true,
          make: true,
          model: true,
          reservePriceCents: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
          bids: { orderBy: { amountCents: "desc" }, take: 1, select: { amountCents: true } },
        },
      },
    },
  });
  if (!thread) return null;

  if (!viewerIsAdmin && thread.isHidden) {
    return null;
  }

  if (
    viewerUserId &&
    !viewerIsAdmin &&
    (await viewerBlocksUserId(prisma, viewerUserId, thread.authorId))
  ) {
    return null;
  }

  const replyPage = await listForumRepliesPage({
    threadId: thread.id,
    take: repliesPagination?.take ?? 40,
    cursorId: repliesPagination?.cursorId ?? null,
    viewerUserId,
    viewerIsAdmin,
  });

  const [threadRx, viewerThreadRx] = await Promise.all([
    summarizeThreadReactionsForMany([thread.id]),
    viewerUserId
      ? prisma.forumThreadReaction.findUnique({
          where: {
            threadId_userId: { threadId: thread.id, userId: viewerUserId },
          },
          select: { kind: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    ok: true,
    thread: {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      replyCount: thread.replyCount,
      locked: thread.locked,
      lastActivityAt: thread.lastActivityAt.toISOString(),
      createdAt: thread.createdAt.toISOString(),
      category: {
        id: thread.category.id,
        slug: thread.category.slug,
        title: thread.category.title,
        space: {
          id: thread.category.space.id,
          slug: thread.category.space.slug,
          title: thread.category.space.title,
        },
      },
      auction: thread.auction
        ? {
            id: thread.auction.id,
            title: thread.auction.title,
            status: thread.auction.status,
            endAt: thread.auction.endAt.toISOString(),
            year: thread.auction.year,
            make: thread.auction.make,
            model: thread.auction.model,
            leadImageUrl: thread.auction.images[0]?.url ?? null,
            highBidCents: thread.auction.bids[0]?.amountCents ?? 0,
            reservePriceCents: thread.auction.reservePriceCents,
          }
        : null,
      demoSeed: thread.isDemoSeed,
      reactionSummary: threadRx.get(thread.id) ?? emptyReactionSummary(),
      viewerReactionKind: viewerThreadRx?.kind ?? null,
      author: {
        id: thread.author.id,
        handle: thread.author.handle,
        name: thread.author.name,
        avatarUrl: thread.author.avatarUrl,
        badges: thread.author.userBadges.map((ub) => ({
          slug: ub.badge.slug,
          name: ub.badge.name,
        })),
      },
      replies: replyPage.replies,
      repliesNextCursor: replyPage.nextCursor,
    },
  };
}

export async function createForumThread(input: {
  authorId: string;
  categoryId: string;
  title: string;
  body: string;
}): Promise<ForumServiceOk<{ threadId: string }> | ForumServiceError> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!input.categoryId.trim()) {
    return { ok: false, error: "Lower Gear is required." };
  }
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (!body) {
    return { ok: false, error: "Body is required." };
  }

  const category = await prisma.forumCategory.findUnique({
    where: { id: input.categoryId },
    include: { space: true },
  });
  if (!category) {
    return { ok: false, error: "Lower Gear not found." };
  }
  if (!category.space.isActive) {
    return { ok: false, error: "This Gear is not available." };
  }

  const thread = await prisma.forumThread.create({
    data: {
      categoryId: input.categoryId,
      authorId: input.authorId,
      title,
      body,
      replyCount: 0,
      lastActivityAt: new Date(),
    },
    select: { id: true },
  });
  return { ok: true, threadId: thread.id };
}

export async function createForumReply(input: {
  authorId: string;
  threadId: string;
  body: string;
  parentReplyId?: string | null;
}): Promise<ForumServiceOk<{ replyId: string; replyCount: number }> | ForumServiceError> {
  const body = input.body.trim();
  if (!body) {
    return { ok: false, error: "Reply cannot be empty." };
  }

  const parentReplyId = input.parentReplyId?.trim() || null;

  const thread = await prisma.forumThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      locked: true,
      isHidden: true,
      title: true,
      authorId: true,
      category: {
        select: { slug: true, space: { select: { slug: true } } },
      },
    },
  });
  if (!thread) {
    return { ok: false, error: "Thread not found." };
  }
  if (thread.isHidden) {
    return { ok: false, error: "This thread is not available." };
  }
  if (thread.locked) {
    return { ok: false, error: "This thread is locked." };
  }

  let parentForNotify: { authorId: string; body: string } | null = null;
  if (parentReplyId) {
    const parent = await prisma.forumReply.findFirst({
      where: { id: parentReplyId, threadId: input.threadId },
      select: { id: true, authorId: true, body: true },
    });
    if (!parent) {
      return { ok: false, error: "Parent reply not found in this thread." };
    }
    parentForNotify = { authorId: parent.authorId, body: parent.body };
  }

  const result = await prisma.$transaction(async (tx) => {
    const reply = await tx.forumReply.create({
      data: {
        threadId: input.threadId,
        authorId: input.authorId,
        body,
        parentReplyId,
      },
      select: { id: true },
    });
    const updated = await tx.forumThread.update({
      where: { id: input.threadId },
      data: {
        replyCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
      select: { replyCount: true },
    });
    return { replyId: reply.id, replyCount: updated.replyCount };
  });

  const actor = await prisma.user.findUnique({
    where: { id: input.authorId },
    select: { handle: true, name: true },
  });

  if (actor) {
    const gearSlug = thread.category.space.slug;
    const lowerGearSlug = thread.category.slug;

    if (parentForNotify) {
      await notifyReplyToReply({
        prisma,
        recipientId: parentForNotify.authorId,
        actorId: input.authorId,
        threadId: input.threadId,
        replyId: result.replyId,
        gearSlug,
        lowerGearSlug,
        actorHandle: actor.handle,
        actorName: actor.name,
        parentSnippet: parentForNotify.body,
      });
    } else if (thread.authorId !== input.authorId) {
      await notifyThreadReply({
        prisma,
        recipientId: thread.authorId,
        actorId: input.authorId,
        threadId: input.threadId,
        replyId: result.replyId,
        gearSlug,
        lowerGearSlug,
        actorHandle: actor.handle,
        actorName: actor.name,
        threadTitle: thread.title,
      });
    }

    const mentionHandles = extractMentionHandles(body).filter(
      (h) => h !== actor.handle.toLowerCase()
    );
    const mentionedUsers =
      mentionHandles.length > 0
        ? await prisma.user.findMany({
            where: { handle: { in: mentionHandles, mode: "insensitive" } },
            select: { id: true },
          })
        : [];
    for (const u of mentionedUsers) {
      await notifyMention({
        prisma,
        recipientId: u.id,
        actorId: input.authorId,
        threadId: input.threadId,
        replyId: result.replyId,
        gearSlug,
        lowerGearSlug,
        actorHandle: actor.handle,
        actorName: actor.name,
        snippet: body,
      });
    }

    await notifySubscribedThreadNewReply({
      prisma,
      threadId: input.threadId,
      replyId: result.replyId,
      actorId: input.authorId,
      threadAuthorId: thread.authorId,
      isDirectThreadReply: !parentForNotify,
      gearSlug,
      lowerGearSlug,
      threadTitle: thread.title,
      actorHandle: actor.handle,
      actorName: actor.name,
    });
  }

  return { ok: true, ...result };
}
