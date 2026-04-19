import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Notification id required." }, { status: 400 });
  }

  const existing = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
