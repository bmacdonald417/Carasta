import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let userId = await getJwtSubjectUserId(req);
  if (!userId && isReviewModeEnabled()) {
    userId = (await getReviewModeContext())?.sellerUserId;
  }
  if (!userId) return NextResponse.json({ count: 0 });

  const count = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  return NextResponse.json({ count });
}
