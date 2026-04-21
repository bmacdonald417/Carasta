import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export type SellerMarketingExportUser = { id: string; handle: string };

export type SellerMarketingCsvAuthResult =
  | { ok: true; user: SellerMarketingExportUser }
  | { ok: false; response: NextResponse };

/**
 * Shared gate for seller-only marketing CSV routes: marketing on, signed in, handle matches session user.
 */
export async function requireSellerMarketingCsvAccess(
  handleParam: string
): Promise<SellerMarketingCsvAuthResult> {
  if (!isMarketingEnabled()) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false }, { status: 404 }),
    };
  }
  if (isReviewModeEnabled()) {
    const ctx = await getReviewModeContext();
    if (ctx && ctx.sellerHandle === handleParam.trim().toLowerCase()) {
      return {
        ok: true,
        user: { id: ctx.sellerUserId, handle: ctx.sellerHandle },
      };
    }
  }
  const session = await getSession();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false }, { status: 401 }),
    };
  }
  const handle = handleParam.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { handle },
    select: { id: true, handle: true },
  });
  if (!user || user.id !== uid) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false }, { status: 404 }),
    };
  }
  return { ok: true, user };
}
