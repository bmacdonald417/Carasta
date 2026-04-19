import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ProfileDiscussionActivityRow =
  | {
      kind: "thread";
      id: string;
      at: Date;
      title: string;
      gearSlug: string;
      lowerGearSlug: string;
    }
  | {
      kind: "reply";
      id: string;
      at: Date;
      body: string;
      threadId: string;
      threadTitle: string;
      gearSlug: string;
      lowerGearSlug: string;
    };

/**
 * Unified Carmunity Discussions activity timeline (threads + replies) with offset pagination.
 */
export async function listProfileDiscussionActivityPage(input: {
  userId: string;
  page: number;
  take: number;
}): Promise<{ items: ProfileDiscussionActivityRow[]; hasNextPage: boolean; page: number }> {
  const take = Math.min(Math.max(input.take, 1), 20);
  const page = Math.max(1, input.page);
  const skip = (page - 1) * take;

  const rows = await prisma.$queryRaw<
    Array<{
      kind: "thread" | "reply";
      id: string;
      at: Date;
      title: string | null;
      body: string | null;
      thread_id: string | null;
      thread_title: string | null;
      gear_slug: string | null;
      lower_gear_slug: string | null;
    }>
  >(Prisma.sql`
    WITH unioned AS (
      SELECT
        'thread'::text AS kind,
        t.id AS id,
        t."createdAt" AS at,
        t.title AS title,
        NULL::text AS body,
        t.id AS thread_id,
        t.title AS thread_title,
        s.slug AS gear_slug,
        c.slug AS lower_gear_slug
      FROM "ForumThread" t
      JOIN "ForumCategory" c ON c.id = t."categoryId"
      JOIN "ForumSpace" s ON s.id = c."spaceId"
      WHERE t."authorId" = ${input.userId}

      UNION ALL

      SELECT
        'reply'::text AS kind,
        r.id AS id,
        r."createdAt" AS at,
        NULL::text AS title,
        r.body AS body,
        t.id AS thread_id,
        t.title AS thread_title,
        s.slug AS gear_slug,
        c.slug AS lower_gear_slug
      FROM "ForumReply" r
      JOIN "ForumThread" t ON t.id = r."threadId"
      JOIN "ForumCategory" c ON c.id = t."categoryId"
      JOIN "ForumSpace" s ON s.id = c."spaceId"
      WHERE r."authorId" = ${input.userId}
    )
    SELECT *
    FROM unioned u
    ORDER BY u.at DESC, u.id DESC
    OFFSET ${skip}
    LIMIT ${take + 1}
  `);

  const hasNextPage = rows.length > take;
  const slice = hasNextPage ? rows.slice(0, take) : rows;

  const items: ProfileDiscussionActivityRow[] = slice.map((r) => {
    if (r.kind === "thread") {
      return {
        kind: "thread",
        id: r.id,
        at: r.at,
        title: r.title ?? "",
        gearSlug: r.gear_slug ?? "",
        lowerGearSlug: r.lower_gear_slug ?? "",
      };
    }
    return {
      kind: "reply",
      id: r.id,
      at: r.at,
      body: r.body ?? "",
      threadId: r.thread_id ?? "",
      threadTitle: r.thread_title ?? "",
      gearSlug: r.gear_slug ?? "",
      lowerGearSlug: r.lower_gear_slug ?? "",
    };
  });

  return { items, hasNextPage, page };
}
