import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export type MarketingWorkspaceUser = { id: string };

export type MarketingWorkspaceAuthResult =
  | { ok: true; user: MarketingWorkspaceUser }
  | { ok: false; response: NextResponse };

/**
 * Session auth + marketing feature flag for seller workspace APIs.
 */
export async function requireMarketingWorkspaceSession(): Promise<MarketingWorkspaceAuthResult> {
  if (!isMarketingEnabled()) {
    return { ok: false, response: NextResponse.json({ message: "Not found." }, { status: 404 }) };
  }
  if (isReviewModeEnabled()) {
    const ctx = await getReviewModeContext();
    if (ctx) return { ok: true, user: { id: ctx.sellerUserId } };
  }
  const session = await getSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) {
    return { ok: false, response: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  }
  return { ok: true, user: { id } };
}

export async function assertAuctionOwnedBySeller(
  auctionId: string,
  sellerId: string
): Promise<{ id: string } | null> {
  return prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: { id: true },
  });
}

export async function assertPlanOwnedBySeller(
  planId: string,
  sellerId: string
): Promise<{ id: string; auctionId: string } | null> {
  const plan = await prisma.listingMarketingPlan.findFirst({
    where: {
      id: planId,
      createdById: sellerId,
      auction: { sellerId },
    },
    select: { id: true, auctionId: true },
  });
  return plan;
}
