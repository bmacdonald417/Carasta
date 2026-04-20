import type { PrismaClient } from "@prisma/client";

import { discussionThreadPath } from "@/lib/discussions/discussion-paths";

export async function isUserSubscribedToThread(input: {
  prisma: PrismaClient;
  userId: string;
  threadId: string;
}): Promise<boolean> {
  const row = await input.prisma.forumThreadSubscription.findUnique({
    where: {
      userId_threadId: { userId: input.userId, threadId: input.threadId },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function listSavedThreadsForUser(input: {
  prisma: PrismaClient;
  userId: string;
  take?: number;
}): Promise<
  Array<{
    id: string;
    title: string;
    gearSlug: string;
    lowerGearSlug: string;
    lastActivityAt: Date;
    subscribedAt: Date;
    hasNewActivity: boolean;
  }>
> {
  const take = Math.min(Math.max(input.take ?? 20, 1), 50);
  const rows = await input.prisma.forumThreadSubscription.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      createdAt: true,
      lastViewedAt: true,
      thread: {
        select: {
          id: true,
          title: true,
          lastActivityAt: true,
          isHidden: true,
          category: {
            select: { slug: true, space: { select: { slug: true } } },
          },
        },
      },
    },
  });
  return rows
    .filter((r) => !r.thread.isHidden)
    .map((r) => {
      const baseline = r.lastViewedAt ?? r.createdAt;
      const hasNewActivity = r.thread.lastActivityAt.getTime() > baseline.getTime();
      return {
        id: r.thread.id,
        title: r.thread.title,
        gearSlug: r.thread.category.space.slug,
        lowerGearSlug: r.thread.category.slug,
        lastActivityAt: r.thread.lastActivityAt,
        subscribedAt: r.createdAt,
        hasNewActivity,
      };
    });
}

/** Marks a saved thread as “seen” for lightweight new-activity badges (Phase J). */
export async function touchForumThreadSubscriptionViewed(input: {
  prisma: PrismaClient;
  userId: string;
  threadId: string;
}): Promise<void> {
  await input.prisma.forumThreadSubscription.updateMany({
    where: { userId: input.userId, threadId: input.threadId },
    data: { lastViewedAt: new Date() },
  });
}

export function savedThreadHref(row: { gearSlug: string; lowerGearSlug: string; id: string }): string {
  return discussionThreadPath(row.gearSlug, row.lowerGearSlug, row.id);
}
