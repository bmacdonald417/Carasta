import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications?take=&cursorCreatedAt=&cursorId=
 * Returns `{ items, nextCursor }` for Carmunity + legacy in-app notifications.
 */
export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ items: [], nextCursor: null });
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

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
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
    select: { id: true, type: true, payloadJson: true, readAt: true, createdAt: true },
  });

  const hasNext = notifications.length > limit;
  const slice = hasNext ? notifications.slice(0, limit) : notifications;
  const last = slice[slice.length - 1];

  const items = slice.map((n) => {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(n.payloadJson) as Record<string, unknown>;
    } catch (_) {}
    return {
      id: n.id,
      type: n.type,
      payload,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  });

  return NextResponse.json({
    items,
    nextCursor:
      hasNext && last
        ? { createdAt: last.createdAt.toISOString(), id: last.id }
        : null,
  });
}
