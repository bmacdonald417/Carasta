import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) return NextResponse.json([]);

  const notifications = await prisma.notification.findMany({
    where: { userId: token.sub },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, type: true, payloadJson: true, readAt: true, createdAt: true },
  });

  const parsed = notifications.map((n) => {
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

  return NextResponse.json(parsed);
}
