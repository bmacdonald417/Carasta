import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { walletHistoryQuerySchema } from "@/lib/validations/rewards/wallet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = walletHistoryQuerySchema.safeParse({
    take: searchParams.get("take") ?? undefined,
    cursorCreatedAt: searchParams.get("cursorCreatedAt") ?? undefined,
    cursorId: searchParams.get("cursorId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid query." }, { status: 400 });
  }

  const limit = parsed.data.take;
  const cursorCreatedAtRaw = parsed.data.cursorCreatedAt;
  const cursorId = parsed.data.cursorId;
  const hasCursor = Boolean(cursorCreatedAtRaw && cursorId);
  const cursorCreatedAt = hasCursor ? new Date(cursorCreatedAtRaw!) : null;
  if (hasCursor && !cursorCreatedAt?.getTime()) {
    return NextResponse.json({ ok: false, error: "Invalid cursor." }, { status: 400 });
  }

  const rows = await prisma.walletTransaction.findMany({
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
    select: {
      id: true,
      kind: true,
      status: true,
      amount: true,
      currency: true,
      reasonCode: true,
      description: true,
      createdAt: true,
      expiresAt: true,
      relatedEventId: true,
      relatedTxnId: true,
      redemptionId: true,
      rewardCampaignId: true,
      adminAdjustmentId: true,
    },
  });

  const hasNext = rows.length > limit;
  const slice = hasNext ? rows.slice(0, limit) : rows;
  const last = slice[slice.length - 1];

  return NextResponse.json({
    ok: true,
    items: slice.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt?.toISOString() ?? null,
    })),
    nextCursor: hasNext && last ? { createdAt: last.createdAt.toISOString(), id: last.id } : null,
  });
}

