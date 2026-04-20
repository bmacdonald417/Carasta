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
  }>
> {
  const take = Math.min(Math.max(input.take ?? 20, 1), 50);
  const rows = await input.prisma.forumThreadSubscription.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      createdAt: true,
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
    .map((r) => ({
      id: r.thread.id,
      title: r.thread.title,
      gearSlug: r.thread.category.space.slug,
      lowerGearSlug: r.thread.category.slug,
      lastActivityAt: r.thread.lastActivityAt,
      subscribedAt: r.createdAt,
    }));
}

export function savedThreadHref(row: { gearSlug: string; lowerGearSlug: string; id: string }): string {
  return discussionThreadPath(row.gearSlug, row.lowerGearSlug, row.id);
}
