import { MarketingCampaignStatus, MarketingTrafficEventType, MarketingTrafficSource } from "@prisma/client";

import { prisma } from "@/lib/db";

function directKeyFor(userA: string, userB: string, auctionId?: string) {
  const pair = userA < userB ? `${userA}:${userB}` : `${userB}:${userA}`;
  return auctionId ? `${pair}:a:${auctionId}` : `${pair}:g`;
}

export async function ensureReviewModeDemoData() {
  const sellerHandle =
    process.env.REVIEW_MODE_DEMO_HANDLE?.trim().toLowerCase() || "trackdaytom";

  const seller = await prisma.user.findFirst({
    where: { handle: sellerHandle },
    select: { id: true, handle: true, name: true },
  });
  if (!seller) return;

  const otherUser = await prisma.user.findFirst({
    where: { id: { not: seller.id } },
    orderBy: { createdAt: "asc" },
    select: { id: true, handle: true, name: true },
  });
  if (!otherUser) return;

  const liveAuction = await prisma.auction.findFirst({
    where: { sellerId: seller.id, status: "LIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
  if (!liveAuction) return;

  const preset = await prisma.marketingPreset.findFirst({
    where: { userId: seller.id },
    select: { id: true },
  });
  if (!preset) {
    await prisma.marketingPreset.create({
      data: {
        userId: seller.id,
        name: "Review preset",
        source: "carmunity",
        medium: "organic",
        campaignLabel: "review-mode",
        copyVariant: "short",
        includeHashtags: true,
        includeKeywords: true,
        isDefault: true,
      },
    });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { userId: seller.id, auctionId: liveAuction.id, name: "Review launch" },
    select: { id: true },
  });
  if (!campaign) {
    await prisma.campaign.create({
      data: {
        auctionId: liveAuction.id,
        userId: seller.id,
        name: "Review launch",
        type: "CARMUNITY_PUSH",
        status: MarketingCampaignStatus.ACTIVE,
        startAt: new Date(),
      },
    });
  }

  const plan = await prisma.listingMarketingPlan.findUnique({
    where: { auctionId: liveAuction.id },
    select: { id: true },
  });
  const planId =
    plan?.id ??
    (
      await prisma.listingMarketingPlan.create({
        data: {
          auctionId: liveAuction.id,
          createdById: seller.id,
          objective: "Drive qualified visibility for review-mode demo listing.",
          audience: "Enthusiasts, bidders, and internal product reviewers.",
          positioning: "A polished demo listing that shows how the seller workspace supports real promotion.",
          channels: ["carmunity", "instagram", "email"],
        },
        select: { id: true },
      })
    ).id;

  const taskCount = await prisma.listingMarketingTask.count({ where: { planId } });
  if (taskCount === 0) {
    await prisma.listingMarketingTask.createMany({
      data: [
        {
          planId,
          title: "Confirm launch positioning",
          description: "Review the listing headline, angle, and supporting detail before the promotional push.",
          channel: "carmunity",
          type: "CHECKLIST",
          sortOrder: 0,
        },
        {
          planId,
          title: "Refresh short-form caption",
          description: "Use a short social variant for first-pass visibility.",
          channel: "instagram",
          type: "CHECKLIST",
          sortOrder: 1,
        },
        {
          planId,
          title: "Review ending-soon plan",
          description: "Make sure the listing has a closing narrative and final CTA ready.",
          channel: "email",
          type: "REMINDER",
          sortOrder: 2,
        },
      ],
    });
  }

  const artifactCount = await prisma.listingMarketingArtifact.count({ where: { planId } });
  if (artifactCount === 0) {
    await prisma.listingMarketingArtifact.createMany({
      data: [
        {
          planId,
          type: "CAPTION",
          channel: "carmunity",
          content: "Fresh on Carasta: review-mode demo listing with a complete seller workspace behind it.",
          version: 1,
        },
        {
          planId,
          type: "HEADLINE",
          channel: "instagram",
          content: "Collector-grade listing, review-ready workspace.",
          version: 1,
        },
        {
          planId,
          type: "BODY",
          channel: "email",
          content: "Use this listing to review the full seller growth workspace, campaign planning, and AI-assisted tools inside Carasta.",
          version: 1,
        },
      ],
    });
  }

  const trafficCount = await prisma.trafficEvent.count({
    where: { auctionId: liveAuction.id },
  });
  if (trafficCount < 8) {
    const now = Date.now();
    await prisma.trafficEvent.createMany({
      data: [
        {
          auctionId: liveAuction.id,
          userId: otherUser.id,
          eventType: MarketingTrafficEventType.VIEW,
          source: MarketingTrafficSource.CARMUNITY,
          createdAt: new Date(now - 1000 * 60 * 60 * 3),
        },
        {
          auctionId: liveAuction.id,
          userId: otherUser.id,
          eventType: MarketingTrafficEventType.VIEW,
          source: MarketingTrafficSource.INSTAGRAM,
          createdAt: new Date(now - 1000 * 60 * 60 * 2),
        },
        {
          auctionId: liveAuction.id,
          userId: otherUser.id,
          eventType: MarketingTrafficEventType.SHARE_CLICK,
          source: MarketingTrafficSource.CARMUNITY,
          metadata: { shareTarget: "copy_link" },
          createdAt: new Date(now - 1000 * 60 * 90),
        },
        {
          auctionId: liveAuction.id,
          userId: otherUser.id,
          eventType: MarketingTrafficEventType.BID_CLICK,
          source: MarketingTrafficSource.CARMUNITY,
          metadata: { bidUiSurface: "auction_detail" },
          createdAt: new Date(now - 1000 * 60 * 30),
        },
        {
          auctionId: liveAuction.id,
          userId: otherUser.id,
          eventType: MarketingTrafficEventType.EXTERNAL_REFERRAL,
          source: MarketingTrafficSource.EMAIL,
          createdAt: new Date(now - 1000 * 60 * 20),
        },
      ],
    });
  }

  const convoKey = directKeyFor(seller.id, otherUser.id, liveAuction.id);
  const conversation = await prisma.conversation.upsert({
    where: { directKey: convoKey },
    update: {},
    create: {
      directKey: convoKey,
      auctionId: liveAuction.id,
      participants: {
        create: [{ userId: seller.id }, { userId: otherUser.id }],
      },
      lastMessageAt: new Date(),
      lastMessagePreview: "Looks strong — can you clarify the documentation?",
    },
    select: { id: true },
  });

  const messageCount = await prisma.message.count({
    where: { conversationId: conversation.id },
  });
  if (messageCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: otherUser.id,
          body: "Looks strong overall. Can you clarify what documentation is available with the car?",
        },
        {
          conversationId: conversation.id,
          senderId: seller.id,
          body: "Yes — service records and manuals are available. I can add that to the listing detail.",
        },
        {
          conversationId: conversation.id,
          senderId: otherUser.id,
          body: "Perfect. The seller workspace review also looks much clearer with the new summary layer.",
        },
      ],
    });
  }

  const supportNotification = await prisma.notification.findFirst({
    where: {
      userId: seller.id,
      type: "REVIEW_MODE_MESSAGE",
      targetId: conversation.id,
    },
    select: { id: true },
  });
  if (!supportNotification) {
    await prisma.notification.create({
      data: {
        userId: seller.id,
        actorId: otherUser.id,
        targetId: conversation.id,
        type: "REVIEW_MODE_MESSAGE",
        payloadJson: JSON.stringify({
          href: `/messages/${conversation.id}`,
          title: "Review message: documentation question on the demo listing",
        }),
      },
    });
  }

  const linkedPromoCount = await prisma.post.count({
    where: { auctionId: liveAuction.id, authorId: seller.id },
  });
  if (linkedPromoCount === 0) {
    await prisma.post.create({
      data: {
        authorId: seller.id,
        auctionId: liveAuction.id,
        content:
          "Review-mode promo post for the demo listing. Useful for checking linked Carmunity promo cards and seller workflow context.",
      },
    });
  }

  const reportCount = await prisma.discussionReport.count();
  if (reportCount === 0) {
    const reply = await prisma.forumReply.findFirst({
      where: { isDemoSeed: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, threadId: true, authorId: true },
    });
    if (reply) {
      await prisma.discussionReport.create({
        data: {
          reporterId: otherUser.id,
          replyId: reply.id,
          threadId: reply.threadId,
          reason: "other",
          details: "Review-mode seeded moderation item for admin surface walkthrough.",
        },
      });
    }
  }
}
