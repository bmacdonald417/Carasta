import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { discussionThreadReplyHref } from "@/lib/discussions/discussion-paths";
import { peerUserIdsHiddenFromViewer } from "@/lib/user-safety";

export async function resolveFollowingFeedAuthorAllowlist(viewerId: string): Promise<string[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });
  const ids = following.map((f) => f.followingId);
  if (ids.length === 0) return [];

  const hidden = await peerUserIdsHiddenFromViewer(prisma, viewerId, ids);
  const mutedRows = await prisma.userMute.findMany({
    where: { userId: viewerId, mutedUserId: { in: ids } },
    select: { mutedUserId: true },
  });
  const muted = new Set(mutedRows.map((m) => m.mutedUserId));

  return ids.filter((id) => !hidden.has(id) && !muted.has(id));
}

export type FollowingFeedPostPayload = {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  liked: boolean;
  author: {
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

export type FollowingFeedThreadPayload = {
  id: string;
  title: string;
  snippet: string;
  createdAt: string;
  replyCount: number;
  reactionCount: number;
  gearSlug: string;
  lowerGearSlug: string;
  lowerGearTitle: string;
  gearTitle: string;
  href: string;
  author: {
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

export type FollowingFeedReplyPayload = {
  id: string;
  snippet: string;
  createdAt: string;
  threadId: string;
  threadTitle: string;
  gearSlug: string;
  lowerGearSlug: string;
  href: string;
  author: {
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

export type FollowingFeedItem =
  | { type: "post"; sortAt: string; post: FollowingFeedPostPayload }
  | { type: "thread"; sortAt: string; thread: FollowingFeedThreadPayload }
  | { type: "reply"; sortAt: string; reply: FollowingFeedReplyPayload };

function snippetFromBody(body: string, max: number) {
  const t = body.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const followingThreadSelect = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
  replyCount: true,
  author: {
    select: { id: true, handle: true, name: true, avatarUrl: true },
  },
  category: {
    select: {
      slug: true,
      title: true,
      space: { select: { slug: true, title: true, isActive: true } },
    },
  },
  _count: { select: { threadReactions: true } },
} satisfies Prisma.ForumThreadSelect;

export async function getFollowingFeedPayload(
  viewerId: string,
  input?: { take?: number }
): Promise<FollowingFeedItem[]> {
  const take = Math.min(Math.max(input?.take ?? 50, 1), 80);
  const perSource = Math.min(45, Math.max(take, 20));

  const allowed = await resolveFollowingFeedAuthorAllowlist(viewerId);
  if (allowed.length === 0) return [];

  const baseThreadFilter: Prisma.ForumThreadWhereInput = {
    authorId: { in: allowed },
    isHidden: false,
    category: { space: { isActive: true } },
  };

  const baseReplyFilter: Prisma.ForumReplyWhereInput = {
    authorId: { in: allowed },
    isHidden: false,
    thread: {
      isHidden: false,
      category: { space: { isActive: true } },
    },
  };

  const [posts, threads, replies] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: { in: allowed } },
      orderBy: { createdAt: "desc" },
      take: perSource,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        author: {
          select: { id: true, handle: true, name: true, avatarUrl: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.forumThread.findMany({
      where: baseThreadFilter,
      orderBy: { createdAt: "desc" },
      take: perSource,
      select: followingThreadSelect,
    }),
    prisma.forumReply.findMany({
      where: baseReplyFilter,
      orderBy: { createdAt: "desc" },
      take: perSource,
      select: {
        id: true,
        body: true,
        createdAt: true,
        threadId: true,
        author: {
          select: { id: true, handle: true, name: true, avatarUrl: true },
        },
        thread: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                slug: true,
                space: { select: { slug: true, isActive: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const postIds = posts.map((p) => p.id);
  const likedRows =
    postIds.length > 0
      ? await prisma.like.findMany({
          where: { userId: viewerId, postId: { in: postIds } },
          select: { postId: true },
        })
      : [];
  const likedSet = new Set(likedRows.map((l) => l.postId));

  const items: FollowingFeedItem[] = [];

  for (const p of posts) {
    items.push({
      type: "post",
      sortAt: p.createdAt.toISOString(),
      post: {
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt.toISOString(),
        liked: likedSet.has(p.id),
        author: p.author,
        _count: p._count,
      },
    });
  }

  for (const t of threads) {
    if (!t.category.space.isActive) continue;
    const gearSlug = t.category.space.slug;
    const lowerGearSlug = t.category.slug;
    items.push({
      type: "thread",
      sortAt: t.createdAt.toISOString(),
      thread: {
        id: t.id,
        title: t.title,
        snippet: snippetFromBody(t.body, 200),
        createdAt: t.createdAt.toISOString(),
        replyCount: t.replyCount,
        reactionCount: t._count.threadReactions,
        gearSlug,
        lowerGearSlug,
        lowerGearTitle: t.category.title,
        gearTitle: t.category.space.title,
        href: `/discussions/${gearSlug}/${lowerGearSlug}/${t.id}`,
        author: t.author,
      },
    });
  }

  for (const r of replies) {
    const space = r.thread.category.space;
    if (!space.isActive) continue;
    const gearSlug = space.slug;
    const lowerGearSlug = r.thread.category.slug;
    items.push({
      type: "reply",
      sortAt: r.createdAt.toISOString(),
      reply: {
        id: r.id,
        snippet: snippetFromBody(r.body, 180),
        createdAt: r.createdAt.toISOString(),
        threadId: r.thread.id,
        threadTitle: r.thread.title,
        gearSlug,
        lowerGearSlug,
        href: discussionThreadReplyHref(gearSlug, lowerGearSlug, r.thread.id, r.id),
        author: r.author,
      },
    });
  }

  items.sort((a, b) => (a.sortAt < b.sortAt ? 1 : a.sortAt > b.sortAt ? -1 : 0));
  return items.slice(0, take);
}

export type FollowedThreadPreview = {
  id: string;
  title: string;
  gearSlug: string;
  lowerGearSlug: string;
  lastActivityAt: string;
  authorHandle: string;
};

/** Recent threads authored by people the viewer follows (respects block + mute). */
export async function listFollowedThreadsForViewer(
  viewerId: string | null,
  input?: { take?: number }
): Promise<FollowedThreadPreview[]> {
  const take = Math.min(Math.max(input?.take ?? 6, 1), 12);
  if (!viewerId) return [];

  const allowed = await resolveFollowingFeedAuthorAllowlist(viewerId);
  if (allowed.length === 0) return [];

  const rows = await prisma.forumThread.findMany({
    where: {
      authorId: { in: allowed },
      isHidden: false,
      category: { space: { isActive: true } },
    },
    orderBy: { lastActivityAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      lastActivityAt: true,
      author: { select: { handle: true } },
      category: {
        select: { slug: true, space: { select: { slug: true } } },
      },
    },
  });

  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    gearSlug: t.category.space.slug,
    lowerGearSlug: t.category.slug,
    lastActivityAt: t.lastActivityAt.toISOString(),
    authorHandle: t.author.handle,
  }));
}
