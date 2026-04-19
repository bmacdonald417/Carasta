import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** @deprecated Prefer GET /api/notifications — kept for older clients. */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return NextResponse.json({ items: [], nextCursor: null });

  const { searchParams } = new URL(req.url);
  const take = z.coerce.number().min(1).max(50).safeParse(searchParams.get("take") ?? "10");
  const limit = take.success ? take.data : 10;

  const notifications = await prisma.notification.findMany({
    where: { userId: token.sub },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: { id: true, type: true, payloadJson: true, readAt: true, createdAt: true },
  });

  const items = notifications.map((n) => {
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

  return NextResponse.json({ items, nextCursor: null });
}
