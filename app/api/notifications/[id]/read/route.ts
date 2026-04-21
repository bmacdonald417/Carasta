import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId = await getJwtSubjectUserId(req);
  if (!userId && isReviewModeEnabled()) {
    userId = (await getReviewModeContext())?.sellerUserId;
  }
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (isReviewModeEnabled()) {
    return NextResponse.json({ ok: true, reviewMode: true });
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
