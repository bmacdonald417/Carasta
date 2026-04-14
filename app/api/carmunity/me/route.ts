import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/carmunity/me — current user profile for Carmunity clients (cookie JWT).
 */
export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      handle: true,
      name: true,
      bio: true,
      avatarUrl: true,
      image: true,
      instagramUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      tiktokUrl: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
          garageCars: true,
        },
      },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 9,
        select: {
          id: true,
          imageUrl: true,
          content: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  const avatarUrl = user.avatarUrl ?? user.image ?? null;

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      handle: user.handle,
      name: user.name,
      bio: user.bio,
      avatarUrl,
      instagramUrl: user.instagramUrl,
      facebookUrl: user.facebookUrl,
      twitterUrl: user.twitterUrl,
      tiktokUrl: user.tiktokUrl,
      counts: {
        posts: user._count.posts,
        followers: user._count.followers,
        following: user._count.following,
        garageCars: user._count.garageCars,
      },
      recentPosts: user.posts.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        content: p.content,
      })),
    },
  });
}
