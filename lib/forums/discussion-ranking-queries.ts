import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

import { TOP_WINDOW_DAYS, RANKING_WEIGHTS } from "@/lib/forums/discussion-ranking";

export type ThreadListSort = "trending" | "new" | "top";

export type ThreadVisibilityContext = {
  viewerIsAdmin: boolean;
  /** Users the viewer has blocked — hide their threads from lists (non-admin). */
  blockedAuthorIds: string[];
};

function emptyVisibility(): ThreadVisibilityContext {
  return { viewerIsAdmin: false, blockedAuthorIds: [] };
}

function threadVisibilitySql(ctx: ThreadVisibilityContext, tableAlias = "t") {
  if (ctx.viewerIsAdmin) return Prisma.empty;
  const hidden = Prisma.sql`AND ${Prisma.raw(tableAlias)}."isHidden" = false`;
  if (!ctx.blockedAuthorIds.length) return hidden;
  return Prisma.sql`${hidden} AND ${Prisma.raw(tableAlias)}."authorId" NOT IN (${Prisma.join(
    ctx.blockedAuthorIds
  )})`;
}

/**
 * Returns ordered thread ids for a Lower Gear list page (0-based `skip`, `take` page slice).
 */
export async function listRankedThreadIdsForCategory(input: {
  categoryId: string;
  sort: ThreadListSort;
  skip: number;
  take: number;
  visibility?: ThreadVisibilityContext;
}): Promise<string[]> {
  const { categoryId, sort, skip, take } = input;
  const vis = input.visibility ?? emptyVisibility();

  if (sort === "new") {
    const rows = await prisma.forumThread.findMany({
      where: {
        categoryId,
        ...(vis.viewerIsAdmin
          ? {}
          : {
              isHidden: false,
              ...(vis.blockedAuthorIds.length
                ? { authorId: { notIn: vis.blockedAuthorIds } }
                : {}),
            }),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  const visSql = threadVisibilitySql(vis, "t");

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
        ${visSql}
      ORDER BY
        (t."replyCount" * ${RANKING_WEIGHTS.topReply} + COALESCE(r.c, 0) * ${RANKING_WEIGHTS.topReaction}) DESC,
        t."createdAt" DESC,
        t.id DESC
      OFFSET ${skip}
      LIMIT ${take}
    `);
    return rows.map((r) => r.id);
  }

  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT t.id
    FROM "ForumThread" t
    LEFT JOIN (
      SELECT "threadId", COUNT(*)::int AS c
      FROM "ForumThreadReaction"
      GROUP BY "threadId"
    ) r ON r."threadId" = t.id
    WHERE t."categoryId" = ${categoryId}
      ${visSql}
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

export async function countThreadsInCategory(
  categoryId: string,
  visibility?: ThreadVisibilityContext
): Promise<number> {
  const vis = visibility ?? emptyVisibility();
  if (vis.viewerIsAdmin) {
    return prisma.forumThread.count({ where: { categoryId } });
  }
  return prisma.forumThread.count({
    where: {
      categoryId,
      isHidden: false,
      ...(vis.blockedAuthorIds.length ? { authorId: { notIn: vis.blockedAuthorIds } } : {}),
    },
  });
}

export async function countThreadsInCategoryTopWindow(
  categoryId: string,
  visibility?: ThreadVisibilityContext
): Promise<number> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - TOP_WINDOW_DAYS);
  const vis = visibility ?? emptyVisibility();
  if (vis.viewerIsAdmin) {
    return prisma.forumThread.count({
      where: { categoryId, createdAt: { gte: since } },
    });
  }
  return prisma.forumThread.count({
    where: {
      categoryId,
      createdAt: { gte: since },
      isHidden: false,
      ...(vis.blockedAuthorIds.length ? { authorId: { notIn: vis.blockedAuthorIds } } : {}),
    },
  });
}
