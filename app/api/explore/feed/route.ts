import { NextResponse } from "next/server";

import {
  summarizePostReactionsMerged,
  viewerPostReactionKinds,
} from "@/lib/carmunity/post-reactions";
import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import { prisma } from "@/lib/db";

function emptySummary(): DiscussionReactionTotals {
  return { total: 0, byKind: {} };
}

async function decoratePosts(
  posts: Array<{
    id: string;
    content: string | null;
    imageUrl: string | null;
    createdAt: Date;
    author: {
      id: string;
      handle: string;
      name: string | null;
      avatarUrl: string | null;
    };
    _count: { likes: number; comments: number; postReactions?: number };
  }>,
  userId: string | null
) {
  const ids = posts.map((p) => p.id);
  const merged = await summarizePostReactionsMerged(prisma, ids);
  const viewer = await viewerPostReactionKinds(prisma, userId, ids);
  return posts.map((p) => {
    const reactionSummary = merged.get(p.id) ?? emptySummary();
    const viewerReactionKind = viewer.get(p.id) ?? null;
    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      reactionSummary,
      viewerReactionKind,
      liked: viewerReactionKind === "LIKE",
      _count: {
        likes: p._count.likes,
        comments: p._count.comments,
      },
    };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "latest";
  const userId = searchParams.get("userId");

  const countSelect = { likes: true, comments: true, postReactions: true } as const;

  if (tab === "latest") {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: {
          select: { id: true, handle: true, name: true, avatarUrl: true },
        },
        _count: { select: countSelect },
      },
    });
    const decorated = await decoratePosts(posts, userId);
    return NextResponse.json({ posts: decorated });
  }

  if (tab === "following" && userId) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const ids = following.map((f) => f.followingId);
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids.length ? ids : ["__none__"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: {
          select: { id: true, handle: true, name: true, avatarUrl: true },
        },
        _count: { select: countSelect },
      },
    });
    const decorated = await decoratePosts(posts, userId);
    return NextResponse.json({ posts: decorated });
  }

  const posts = await prisma.post.findMany({
    orderBy: [
      { postReactions: { _count: "desc" } },
      { likes: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    take: 50,
    include: {
      author: {
        select: { id: true, handle: true, name: true, avatarUrl: true },
      },
      _count: { select: countSelect },
    },
  });
  const decorated = await decoratePosts(posts, userId);
  return NextResponse.json({ posts: decorated });
}
