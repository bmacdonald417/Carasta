import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "trending";
  const userId = searchParams.get("userId");

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
        _count: { select: { likes: true, comments: true } },
      },
    });
    const likedPostIds = userId
      ? new Set(
          (
            await prisma.like.findMany({
              where: { userId, postId: { in: posts.map((p) => p.id) } },
              select: { postId: true },
            })
          ).map((l) => l.postId)
        )
      : new Set<string>();
    const withLiked = posts.map((p) => ({
      ...p,
      liked: likedPostIds.has(p.id),
      _count: p._count,
    }));
    return NextResponse.json({ posts: withLiked });
  }

  // Trending: sort by likes count (most liked first)
  const posts = await prisma.post.findMany({
    orderBy: { likes: { _count: "desc" } },
    take: 50,
    include: {
      author: {
        select: { id: true, handle: true, name: true, avatarUrl: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });
  const likedPostIds = userId
    ? new Set(
        (
          await prisma.like.findMany({
            where: { userId, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          })
        ).map((l) => l.postId)
      )
    : new Set<string>();
  const withLiked = posts.map((p) => ({
    ...p,
    liked: likedPostIds.has(p.id),
    _count: p._count,
  }));
  return NextResponse.json({ posts: withLiked });
}
