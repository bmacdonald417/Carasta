import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

import { TOP_WINDOW_DAYS, RANKING_WEIGHTS } from "@/lib/forums/discussion-ranking";

export type ThreadListSort = "trending" | "new" | "top";

/**
 * Returns ordered thread ids for a Lower Gear list page (0-based `skip`, `take` page slice).
 */
export async function listRankedThreadIdsForCategory(input: {
  categoryId: string;
  sort: ThreadListSort;
  skip: number;
  take: number;
}): Promise<string[]> {
  const { categoryId, sort, skip, take } = input;

  if (sort === "new") {
    const rows = await prisma.forumThread.findMany({
      where: { categoryId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  if (sort === "top") {
    const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT t.id
      FROM "ForumThread" t
      LEFT JOIN (
        SELECT "threadId", COUNT(*)::int AS c
        FROM "ForumThreadReaction"
        GROUP BY "threadId"
      ) r ON r."threadId" = t.id
      WHERE t."categoryId" = ${categoryId}
        AND t."createdAt" >= NOW() - (${TOP_WINDOW_DAYS}::int * INTERVAL '1 day')
      ORDER BY
        (t."replyCount" * ${RANKING_WEIGHTS.topReply} + COALESCE(r.c, 0) * ${RANKING_WEIGHTS.topReaction}) DESC,
        t."createdAt" DESC,
        t.id DESC
      OFFSET ${skip}
      LIMIT ${take}
    `);
    return rows.map((r) => r.id);
  }

  // trending
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT t.id
    FROM "ForumThread" t
    LEFT JOIN (
      SELECT "threadId", COUNT(*)::int AS c
      FROM "ForumThreadReaction"
      GROUP BY "threadId"
    ) r ON r."threadId" = t.id
    WHERE t."categoryId" = ${categoryId}
    ORDER BY
      (
        (t."replyCount" * ${RANKING_WEIGHTS.trendingReply} + COALESCE(r.c, 0) * ${RANKING_WEIGHTS.trendingReaction} + 1.0)
        / (1.0 + GREATEST(
          0,
          EXTRACT(EPOCH FROM (NOW() - t."lastActivityAt")) / 3600.0
        ) / ${RANKING_WEIGHTS.trendingRecencyHalfLifeHours})
      ) DESC,
      t."lastActivityAt" DESC,
      t.id DESC
    OFFSET ${skip}
    LIMIT ${take}
  `);
  return rows.map((r) => r.id);
}

export async function countThreadsInCategory(categoryId: string): Promise<number> {
  return prisma.forumThread.count({ where: { categoryId } });
}
