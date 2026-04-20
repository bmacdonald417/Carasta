import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type RecommendedGearRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  activeThreadsApprox: number;
};

/**
 * Gears with the most non-hidden thread activity in the last 14 days (simple Phase I heuristic).
 */
export async function listRecommendedGears(input?: { take?: number }): Promise<RecommendedGearRow[]> {
  const take = Math.min(Math.max(input?.take ?? 4, 1), 8);
  const rows = await prisma.$queryRaw<
    Array<{ id: string; slug: string; title: string; description: string | null; c: bigint }>
  >(Prisma.sql`
    SELECT s.id, s.slug, s.title, s.description, COUNT(t.id)::bigint AS c
    FROM "ForumSpace" s
    JOIN "ForumCategory" fc ON fc."spaceId" = s.id
    JOIN "ForumThread" t ON t."categoryId" = fc.id
    WHERE s."isActive" = true
      AND t."isHidden" = false
      AND t."lastActivityAt" > NOW() - INTERVAL '14 days'
    GROUP BY s.id, s.slug, s.title, s.description
    ORDER BY c DESC, s."sortOrder" ASC
    LIMIT ${take}
  `);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    activeThreadsApprox: Number(r.c),
  }));
}

export type TrendingThreadRow = {
  id: string;
  title: string;
  replyCount: number;
  lastActivityAt: Date;
  gearSlug: string;
  lowerGearSlug: string;
};

/** Cross-Gear trending: reply-weighted with recency decay (aligned with Phase G spirit, simplified). */
export async function listTrendingThreadsGlobal(input?: { take?: number }): Promise<TrendingThreadRow[]> {
  const take = Math.min(Math.max(input?.take ?? 6, 1), 12);
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      replyCount: number;
      lastActivityAt: Date;
      gearSlug: string;
      lowerGearSlug: string;
    }>
  >(Prisma.sql`
    SELECT
      t.id,
      t.title,
      t."replyCount" AS "replyCount",
      t."lastActivityAt" AS "lastActivityAt",
      s.slug AS "gearSlug",
      c.slug AS "lowerGearSlug"
    FROM "ForumThread" t
    JOIN "ForumCategory" c ON c.id = t."categoryId"
    JOIN "ForumSpace" s ON s.id = c."spaceId"
    LEFT JOIN (
      SELECT "threadId", COUNT(*)::int AS rx
      FROM "ForumThreadReaction"
      GROUP BY "threadId"
    ) r ON r."threadId" = t.id
    WHERE s."isActive" = true
      AND t."isHidden" = false
      AND t."lastActivityAt" > NOW() - INTERVAL '30 days'
    ORDER BY
      (
        (t."replyCount" * 2.0 + COALESCE(r.rx, 0) * 1.2 + 1.0)
        / (1.0 + GREATEST(0, EXTRACT(EPOCH FROM (NOW() - t."lastActivityAt")) / 3600.0) / 18.0)
      ) DESC,
      t."lastActivityAt" DESC
    LIMIT ${take}
  `);
  return rows;
}

export type SuggestedUserRow = {
  id: string;
  handle: string;
  name: string | null;
  avatarUrl: string | null;
  activityScore: number;
};

/** Users with the most discussion posts (threads + replies) in the last 30 days. */
export async function listSuggestedDiscussionUsers(input?: {
  take?: number;
  excludeUserId?: string | null;
}): Promise<SuggestedUserRow[]> {
  const take = Math.min(Math.max(input?.take ?? 6, 1), 12);
  const excludeUserId = input?.excludeUserId ?? null;
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      handle: string;
      name: string | null;
      avatarUrl: string | null;
      score: bigint;
    }>
  >(Prisma.sql`
    WITH activity AS (
      SELECT t."authorId" AS uid, COUNT(*)::bigint AS c
      FROM "ForumThread" t
      WHERE t."createdAt" > NOW() - INTERVAL '30 days'
        AND t."isHidden" = false
      GROUP BY t."authorId"
      UNION ALL
      SELECT r."authorId" AS uid, COUNT(*)::bigint AS c
      FROM "ForumReply" r
      JOIN "ForumThread" t ON t.id = r."threadId"
      WHERE r."createdAt" > NOW() - INTERVAL '30 days'
        AND r."isHidden" = false
        AND t."isHidden" = false
      GROUP BY r."authorId"
    ),
    scored AS (
      SELECT uid, SUM(c) AS score
      FROM activity
      GROUP BY uid
    )
    SELECT u.id, u.handle, u.name, u."avatarUrl" AS "avatarUrl", s.score
    FROM scored s
    JOIN "User" u ON u.id = s.uid
    WHERE u."isDemoSeed" = false
      ${excludeUserId ? Prisma.sql`AND u.id <> ${excludeUserId}` : Prisma.empty}
    ORDER BY s.score DESC, u.handle ASC
    LIMIT ${take}
  `);
  return rows.map((r) => ({
    id: r.id,
    handle: r.handle,
    name: r.name,
    avatarUrl: r.avatarUrl,
    activityScore: Number(r.score),
  }));
}
