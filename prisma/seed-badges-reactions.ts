import type { DiscussionReactionKind, PrismaClient } from "@prisma/client";

import {
  DEMO_REPLY_IDS,
  DEMO_THREAD_IDS,
} from "./seed-demo-discussions";

const DEMO_EMAILS = {
  nina: "nina.shift@demo.carasta.com",
  marcus: "marcus.torque@demo.carasta.com",
  elena: "elena.lap@demo.carasta.com",
  kai: "kai.horo@demo.carasta.com",
} as const;

const BADGE_DEFS = [
  {
    slug: "top-contributor",
    name: "Top Contributor",
    description: "Consistently helpful threads and replies.",
    sortOrder: 10,
  },
  {
    slug: "high-engagement",
    name: "High Engagement",
    description: "Community momentum and thoughtful participation.",
    sortOrder: 20,
  },
  {
    slug: "early-member",
    name: "Early Member",
    description: "Among the first builders on Carmunity Discussions.",
    sortOrder: 30,
  },
  {
    slug: "gear-specialist",
    name: "Gear Specialist",
    description: "Deep knowledge in a specific gear domain.",
    sortOrder: 40,
  },
  {
    slug: "verified-builder",
    name: "Verified Builder",
    description: "Trusted voice for builds and diagnostics.",
    sortOrder: 50,
  },
] as const;

async function upsertBadge(
  prisma: PrismaClient,
  def: (typeof BADGE_DEFS)[number]
) {
  return prisma.badge.upsert({
    where: { slug: def.slug },
    create: {
      slug: def.slug,
      name: def.name,
      description: def.description,
      sortOrder: def.sortOrder,
    },
    update: {
      name: def.name,
      description: def.description,
      sortOrder: def.sortOrder,
    },
  });
}

async function award(
  prisma: PrismaClient,
  userId: string,
  badgeId: string
) {
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    create: { userId, badgeId },
    update: {},
  });
}

async function reactThread(
  prisma: PrismaClient,
  threadId: string,
  userId: string,
  kind: DiscussionReactionKind
) {
  await prisma.forumThreadReaction.upsert({
    where: {
      threadId_userId_kind: { threadId, userId, kind },
    },
    create: { threadId, userId, kind },
    update: {},
  });
}

async function reactReply(
  prisma: PrismaClient,
  replyId: string,
  userId: string,
  kind: DiscussionReactionKind
) {
  await prisma.forumReplyReaction.upsert({
    where: {
      replyId_userId_kind: { replyId, userId, kind },
    },
    create: { replyId, userId, kind },
    update: {},
  });
}

/**
 * Scaffold badges + light demo reactions for Phase E preview. Idempotent.
 */
export async function ensureBadgesAndDiscussionReactions(
  prisma: PrismaClient
): Promise<void> {
  const badges = await Promise.all(BADGE_DEFS.map((d) => upsertBadge(prisma, d)));
  const bySlug = Object.fromEntries(badges.map((b) => [b.slug, b.id])) as Record<
    (typeof BADGE_DEFS)[number]["slug"],
    string
  >;

  const [nina, marcus, elena, kai] = await Promise.all([
    prisma.user.findUnique({ where: { email: DEMO_EMAILS.nina }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: DEMO_EMAILS.marcus }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: DEMO_EMAILS.elena }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: DEMO_EMAILS.kai }, select: { id: true } }),
  ]);

  if (!nina || !marcus || !elena || !kai) {
    console.warn("[badges-reactions] Demo users missing — skip badge/reaction seed.");
    return;
  }

  await award(prisma, nina.id, bySlug["top-contributor"]);
  await award(prisma, nina.id, bySlug["early-member"]);
  await award(prisma, marcus.id, bySlug["gear-specialist"]);
  await award(prisma, elena.id, bySlug["high-engagement"]);
  await award(prisma, kai.id, bySlug["verified-builder"]);

  await reactThread(prisma, DEMO_THREAD_IDS.hpde, marcus.id, "FIRE");
  await reactThread(prisma, DEMO_THREAD_IDS.hpde, elena.id, "RESPECT");
  await reactThread(prisma, DEMO_THREAD_IDS.hpde, kai.id, "LIKE");
  await reactThread(prisma, DEMO_THREAD_IDS.idle, nina.id, "WRENCH");
  await reactThread(prisma, DEMO_THREAD_IDS.idle, elena.id, "MIND_BLOWN");
  await reactThread(prisma, DEMO_THREAD_IDS.watches, marcus.id, "LAUGH");
  await reactThread(prisma, DEMO_THREAD_IDS.watches, nina.id, "LIKE");

  await reactReply(prisma, DEMO_REPLY_IDS.hpde_marcus, nina.id, "LIKE");
  await reactReply(prisma, DEMO_REPLY_IDS.hpde_elena, kai.id, "FIRE");
  await reactReply(prisma, DEMO_REPLY_IDS.idle_nina, marcus.id, "RESPECT");

  console.log("[badges-reactions] Ensured badges + demo discussion reactions.");
}
