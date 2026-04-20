import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/forums/me/saved-threads?take=&cursorCreatedAt=&cursorId=
 * Saved discussion threads for the signed-in user (ForumThreadSubscription).
 */
export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const take = z.coerce.number().min(1).max(50).safeParse(searchParams.get("take") ?? "25");
  const limit = take.success ? take.data : 25;

  const cursorCreatedAtRaw = searchParams.get("cursorCreatedAt");
  const cursorId = searchParams.get("cursorId");
  const hasCursor = Boolean(cursorCreatedAtRaw && cursorId);
  const cursorCreatedAt = hasCursor ? new Date(cursorCreatedAtRaw!) : null;
  if (hasCursor && !cursorCreatedAt?.getTime()) {
    return NextResponse.json({ message: "Invalid cursor." }, { status: 400 });
  }

  const rows = await prisma.forumThreadSubscription.findMany({
    where: {
      userId,
      thread: { isHidden: false },
      ...(hasCursor && cursorCreatedAt
        ? {
            OR: [
              { createdAt: { lt: cursorCreatedAt } },
              { AND: [{ createdAt: cursorCreatedAt }, { id: { lt: cursorId! } }] },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      createdAt: true,
      lastViewedAt: true,
      thread: {
        select: {
          id: true,
          title: true,
          replyCount: true,
          lastActivityAt: true,
          category: {
            select: {
              slug: true,
              space: { select: { slug: true, title: true } },
            },
          },
        },
      },
    },
  });

  const hasNext = rows.length > limit;
  const slice = hasNext ? rows.slice(0, limit) : rows;
  const last = slice[slice.length - 1];

  const subscriptions = slice.map((s) => ({
    subscriptionId: s.id,
    subscribedAt: s.createdAt.toISOString(),
    lastViewedAt: s.lastViewedAt?.toISOString() ?? null,
    thread: {
      id: s.thread.id,
      title: s.thread.title,
      replyCount: s.thread.replyCount,
      lastActivityAt: s.thread.lastActivityAt.toISOString(),
      spaceSlug: s.thread.category.space.slug,
      spaceTitle: s.thread.category.space.title,
      categorySlug: s.thread.category.slug,
    },
  }));

  return NextResponse.json({
    ok: true,
    subscriptions,
    nextCursor:
      hasNext && last
        ? { createdAt: last.createdAt.toISOString(), id: last.id }
        : null,
  });
}
