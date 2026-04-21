import { cache } from "react";

import { prisma } from "@/lib/db";
import { ensureReviewModeDemoData } from "@/lib/review-mode-demo-data";

export function isReviewModeEnabled() {
  return process.env.REVIEW_MODE_ENABLED === "true";
}

export function getReviewModeDemoHandle() {
  return process.env.REVIEW_MODE_DEMO_HANDLE?.trim().toLowerCase() || "trackdaytom";
}

export function getReviewModeProfileHandle() {
  return process.env.REVIEW_MODE_PROFILE_HANDLE?.trim().toLowerCase() || "nina_shift";
}

export type ReviewModeContext = {
  sellerUserId: string;
  sellerHandle: string;
  adminUserId: string;
  adminHandle: string;
  profileHandle: string;
  previewAuctionId: string | null;
  previewThreadPath: string | null;
  previewConversationId: string | null;
};

export const getReviewModeContext = cache(async (): Promise<ReviewModeContext | null> => {
  if (!isReviewModeEnabled()) return null;

  await ensureReviewModeDemoData();

  const sellerHandle = getReviewModeDemoHandle();
  const profileHandle = getReviewModeProfileHandle();

  const [seller, profile, thread, conversation] = await Promise.all([
    prisma.user.findFirst({
      where: { handle: sellerHandle },
      select: { id: true, handle: true, role: true },
    }),
    prisma.user.findFirst({
      where: { handle: profileHandle },
      select: { handle: true },
    }),
    prisma.forumThread.findFirst({
      where: { isHidden: false },
      orderBy: { lastActivityAt: "desc" },
      select: {
        id: true,
        category: {
          select: {
            slug: true,
            space: { select: { slug: true } },
          },
        },
      },
    }),
    prisma.conversation.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
  ]);

  if (!seller) return null;

  const previewAuction = await prisma.auction.findFirst({
    where: { sellerId: seller.id, status: "LIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return {
    sellerUserId: seller.id,
    sellerHandle: seller.handle,
    adminUserId: seller.id,
    adminHandle: seller.handle,
    profileHandle: profile?.handle ?? seller.handle,
    previewAuctionId: previewAuction?.id ?? null,
    previewThreadPath: thread
      ? `/discussions/${thread.category.space.slug}/${thread.category.slug}/${thread.id}`
      : null,
    previewConversationId: conversation?.id ?? null,
  };
});
