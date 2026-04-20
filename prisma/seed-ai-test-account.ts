import type { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

import { DEMO_USER_IDS } from "./seed-demo-discussions";

/** Stable ids so `prisma db seed` stays idempotent. */
export const AI_TEST_USER_ID = "demo_user_ai_test_listings";
export const AI_TEST_AUCTION_ID = "demo_auction_ai_smoke_listing";
export const AI_TEST_THREAD_ID = "demo_thread_ai_listing_chat";
export const AI_TEST_REPLY_NINA_ID = "demo_reply_ai_listing_nina";
export const AI_TEST_POST_FEED_ID = "demo_post_ai_test_feed";
export const AI_TEST_POST_PROMO_ID = "demo_post_ai_test_listing_promo";
export const AI_TEST_COMMENT_ID = "demo_comment_ai_test_post";
export const AI_TEST_POST_REACTION_ID = "demo_post_reaction_ai_test_promo";

/** Same password as other seeded demo users (`password123`). */
export const AI_TEST_EMAIL = "ai-test@demo.carasta.com";

/**
 * Max auctions in DB before we skip the big `seed.ts` listing pack (Tom + 10 more listings).
 * The AI test account contributes exactly this many fixed listings (`AI_TEST_AUCTION_ID`).
 * If count is higher, we assume the full pack (or equivalent) is already present.
 */
export const MAX_AUCTIONS_BEFORE_FULL_DEMO_SEED = 1;

const AVATAR = "https://placehold.co/100/2a2a2a/888?text=AI";
const LISTING_IMAGE =
  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800";

/**
 * Idempotent Carmunity + listing slice for exercising AI (marketing copilot, listing copy, etc.).
 * Runs on every seed after forum + taxonomy + discussion demo users exist.
 */
export async function ensureAiTestAccount(prisma: PrismaClient): Promise<void> {
  const consentAt = new Date("2026-01-15T12:00:00.000Z");
  const passwordHash = await hash("password123", 12);

  const testUser = await prisma.user.upsert({
    where: { email: AI_TEST_EMAIL },
    create: {
      id: AI_TEST_USER_ID,
      email: AI_TEST_EMAIL,
      passwordHash,
      handle: "ai_test_driver",
      name: "Alex Rivera",
      bio: "Seeded account for AI smoke tests — listing copy, marketing drafts, and Carmunity previews.",
      location: "Remote",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      instagramUrl: "https://instagram.com/example",
      twitterUrl: "https://twitter.com/example",
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
    update: {
      passwordHash,
      handle: "ai_test_driver",
      name: "Alex Rivera",
      bio: "Seeded account for AI smoke tests — listing copy, marketing drafts, and Carmunity previews.",
      location: "Remote",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      instagramUrl: "https://instagram.com/example",
      twitterUrl: "https://twitter.com/example",
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
  });

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const buyNowExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const auction = await prisma.auction.upsert({
    where: { id: AI_TEST_AUCTION_ID },
    create: {
      id: AI_TEST_AUCTION_ID,
      sellerId: testUser.id,
      title: "2019 Porsche 911 GT3 — AI test listing",
      description:
        "Purpose-built seed listing for AI features: generate captions, headlines, hashtags, and seller workspace tasks against realistic vehicle copy. Two-track owner, mostly street miles with occasional HPDE.",
      year: 2019,
      make: "Porsche",
      model: "911",
      trim: "GT3",
      mileage: 14000,
      reservePriceCents: 16500000,
      buyNowPriceCents: 17800000,
      buyNowExpiresAt: buyNowExpires,
      startAt: now,
      endAt: sevenDays,
      status: "LIVE",
      conditionGrade: "EXCELLENT",
      conditionSummary:
        "Seeded condition narrative for AI summarization: recent PPI, no accidents, ceramic coating front clip, OEM brake pads for street use.",
      imperfections: [
        {
          location: "Rear wing uprights",
          description: "Light road grime — cosmetic only",
          severity: "minor",
        },
      ],
      images: {
        create: [{ url: LISTING_IMAGE, sortOrder: 0 }],
      },
    },
    update: {
      sellerId: testUser.id,
      title: "2019 Porsche 911 GT3 — AI test listing",
      description:
        "Purpose-built seed listing for AI features: generate captions, headlines, hashtags, and seller workspace tasks against realistic vehicle copy. Two-track owner, mostly street miles with occasional HPDE.",
      year: 2019,
      make: "Porsche",
      model: "911",
      trim: "GT3",
      mileage: 14000,
      reservePriceCents: 16500000,
      buyNowPriceCents: 17800000,
      buyNowExpiresAt: buyNowExpires,
      startAt: now,
      endAt: sevenDays,
      status: "LIVE",
      conditionGrade: "EXCELLENT",
      conditionSummary:
        "Seeded condition narrative for AI summarization: recent PPI, no accidents, ceramic coating front clip, OEM brake pads for street use.",
      imperfections: [
        {
          location: "Rear wing uprights",
          description: "Light road grime — cosmetic only",
          severity: "minor",
        },
      ],
    },
  });

  // Ensure primary image exists (upsert path may skip nested creates).
  const imgCount = await prisma.auctionImage.count({ where: { auctionId: auction.id } });
  if (imgCount === 0) {
    await prisma.auctionImage.create({
      data: { auctionId: auction.id, url: LISTING_IMAGE, sortOrder: 0 },
    });
  }

  const nina = await prisma.user.findUnique({ where: { id: DEMO_USER_IDS.nina } });

  const listingCategory = await prisma.forumCategory.findFirst({
    where: { slug: "listing-chat", space: { slug: "listings-auctions" } },
    select: { id: true },
  });

  if (listingCategory) {
    const replyCount = nina ? 1 : 0;
    await prisma.forumThread.upsert({
      where: { id: AI_TEST_THREAD_ID },
      create: {
        id: AI_TEST_THREAD_ID,
        categoryId: listingCategory.id,
        authorId: testUser.id,
        auctionId: auction.id,
        title: "Questions on the AI test GT3 listing",
        body:
          "This thread is anchored to the seeded AI test auction. Use it to preview listing-linked discussions, notifications, and moderation flows.",
        replyCount,
        lastActivityAt: now,
        locked: false,
        isDemoSeed: true,
      },
      update: {
        categoryId: listingCategory.id,
        authorId: testUser.id,
        auctionId: auction.id,
        title: "Questions on the AI test GT3 listing",
        body:
          "This thread is anchored to the seeded AI test auction. Use it to preview listing-linked discussions, notifications, and moderation flows.",
        replyCount,
        lastActivityAt: now,
        isDemoSeed: true,
      },
    });

    if (nina) {
      const replyAt = new Date(now.getTime() - 60 * 60 * 1000);
      await prisma.forumReply.upsert({
        where: { id: AI_TEST_REPLY_NINA_ID },
        create: {
          id: AI_TEST_REPLY_NINA_ID,
          threadId: AI_TEST_THREAD_ID,
          authorId: nina.id,
          body:
            "Love the transparency on imperfections — makes it easier to trust the listing. Any service records for the track days mentioned?",
          isDemoSeed: true,
          createdAt: replyAt,
        },
        update: {
          threadId: AI_TEST_THREAD_ID,
          authorId: nina.id,
          body:
            "Love the transparency on imperfections — makes it easier to trust the listing. Any service records for the track days mentioned?",
          isDemoSeed: true,
        },
      });
    }
  }

  await prisma.post.upsert({
    where: { id: AI_TEST_POST_FEED_ID },
    create: {
      id: AI_TEST_POST_FEED_ID,
      authorId: testUser.id,
      content:
        "Dialing in marketing copy for my GT3 listing — trying Carasta’s AI drafts against real photos this week.",
      imageUrl: LISTING_IMAGE,
    },
    update: {
      authorId: testUser.id,
      content:
        "Dialing in marketing copy for my GT3 listing — trying Carasta’s AI drafts against real photos this week.",
      imageUrl: LISTING_IMAGE,
    },
  });

  await prisma.post.upsert({
    where: { id: AI_TEST_POST_PROMO_ID },
    create: {
      id: AI_TEST_POST_PROMO_ID,
      authorId: testUser.id,
      auctionId: auction.id,
      content: "Live now — 2019 GT3 with reserve. Ask me anything on the listing thread.",
      imageUrl: LISTING_IMAGE,
    },
    update: {
      authorId: testUser.id,
      auctionId: auction.id,
      content: "Live now — 2019 GT3 with reserve. Ask me anything on the listing thread.",
      imageUrl: LISTING_IMAGE,
    },
  });

  if (nina) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: testUser.id,
          followingId: nina.id,
        },
      },
      create: { followerId: testUser.id, followingId: nina.id },
      update: {},
    });
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: nina.id,
          followingId: testUser.id,
        },
      },
      create: { followerId: nina.id, followingId: testUser.id },
      update: {},
    });

    await prisma.like.upsert({
      where: {
        userId_postId: { userId: nina.id, postId: AI_TEST_POST_FEED_ID },
      },
      create: { userId: nina.id, postId: AI_TEST_POST_FEED_ID },
      update: {},
    });

    await prisma.comment.upsert({
      where: { id: AI_TEST_COMMENT_ID },
      create: {
        id: AI_TEST_COMMENT_ID,
        postId: AI_TEST_POST_FEED_ID,
        authorId: nina.id,
        content: "Following along — curious how the AI captions compare to your manual drafts.",
      },
      update: {
        postId: AI_TEST_POST_FEED_ID,
        authorId: nina.id,
        content: "Following along — curious how the AI captions compare to your manual drafts.",
      },
    });

    await prisma.postReaction.upsert({
      where: { id: AI_TEST_POST_REACTION_ID },
      create: {
        id: AI_TEST_POST_REACTION_ID,
        postId: AI_TEST_POST_PROMO_ID,
        userId: nina.id,
        kind: "FIRE",
      },
      update: {
        postId: AI_TEST_POST_PROMO_ID,
        userId: nina.id,
        kind: "FIRE",
      },
    });
  }

  console.log(
    "AI test account ensured:",
    AI_TEST_EMAIL,
    "— auction",
    AI_TEST_AUCTION_ID,
    "(password: password123)",
  );
}
