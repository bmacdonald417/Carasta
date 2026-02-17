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
    const withLiked = await Promise.all(
      posts.map(async (p) => {
        let liked = false;
        if (userId) {
          const like = await prisma.like.findUnique({
            where: {
              userId_postId: { userId, postId: p.id },
            },
          });
          liked = !!like;
        }
        return {
          ...p,
          liked,
          _count: p._count,
        };
      })
    );
    return NextResponse.json({ posts: withLiked });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: { id: true, handle: true, name: true, avatarUrl: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });
  const withLiked = await Promise.all(
    posts.map(async (p) => {
      let liked = false;
      if (userId) {
        const like = await prisma.like.findUnique({
          where: {
            userId_postId: { userId, postId: p.id },
          },
        });
        liked = !!like;
      }
      return {
        ...p,
        liked,
        _count: p._count,
      };
    })
  );
  return NextResponse.json({ posts: withLiked });
}
