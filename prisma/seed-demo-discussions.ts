import type { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

/** Stable primary keys so `prisma db seed` stays idempotent. */
export const DEMO_USER_IDS = {
  nina: "demo_user_nina_shift",
  marcus: "demo_user_marcus_torque",
  elena: "demo_user_elena_lap",
  kai: "demo_user_kai_horo",
} as const;

export const DEMO_THREAD_IDS = {
  hpde: "demo_thread_hpde_first_season",
  idle: "demo_thread_idle_dip_e9x",
  watches: "demo_thread_watches_track_gloves",
} as const;

export const DEMO_REPLY_IDS = {
  hpde_marcus: "demo_reply_hpde_marcus",
  hpde_elena: "demo_reply_hpde_elena",
  idle_nina: "demo_reply_idle_nina",
  idle_kai: "demo_reply_idle_kai",
  watches_elena: "demo_reply_watches_elena",
  watches_nina: "demo_reply_watches_nina",
} as const;

const AVATAR = "https://placehold.co/100/2a2a2a/888?text=U";

/**
 * Idempotent demo users + discussion threads/replies for Carmunity web preview.
 * Runs on every `prisma db seed` after forum spaces exist.
 */
export async function ensureDemoDiscussionSeed(prisma: PrismaClient): Promise<void> {
  const mechanics = await prisma.forumSpace.findUnique({
    where: { slug: "mechanics-corner" },
    select: { id: true },
  });
  const gear = await prisma.forumSpace.findUnique({
    where: { slug: "gear-interests" },
    select: { id: true },
  });
  if (!mechanics || !gear) {
    console.warn(
      "[demo-discussions] Skipping — mechanics-corner or gear-interests space missing."
    );
    return;
  }

  const catGeneral = await prisma.forumCategory.findUnique({
    where: { spaceId_slug: { spaceId: mechanics.id, slug: "general" } },
    select: { id: true },
  });
  const catDiag = await prisma.forumCategory.findUnique({
    where: { spaceId_slug: { spaceId: mechanics.id, slug: "diagnostics" } },
    select: { id: true },
  });
  const catWatches = await prisma.forumCategory.findUnique({
    where: { spaceId_slug: { spaceId: gear.id, slug: "watches" } },
    select: { id: true },
  });
  if (!catGeneral || !catDiag || !catWatches) {
    console.warn("[demo-discussions] Skipping — expected forum categories missing.");
    return;
  }

  const consentAt = new Date("2026-01-15T12:00:00.000Z");
  const passwordHash = await hash("password123", 12);

  const nina = await prisma.user.upsert({
    where: { email: "nina.shift@demo.carasta.com" },
    create: {
      id: DEMO_USER_IDS.nina,
      email: "nina.shift@demo.carasta.com",
      passwordHash,
      handle: "nina_shift",
      name: "Nina Shah",
      bio: "HPDE regular — E92 M3 for track, GR86 for daily. Always chasing clean laps.",
      location: "Austin, TX",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
    update: {
      passwordHash,
      handle: "nina_shift",
      name: "Nina Shah",
      bio: "HPDE regular — E92 M3 for track, GR86 for daily. Always chasing clean laps.",
      location: "Austin, TX",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: "marcus.torque@demo.carasta.com" },
    create: {
      id: DEMO_USER_IDS.marcus,
      email: "marcus.torque@demo.carasta.com",
      passwordHash,
      handle: "marcus_torque",
      name: "Marcus Cole",
      bio: "Independent tech — brakes, suspension, and the occasional stubborn vacuum leak.",
      location: "Denver, CO",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
    update: {
      passwordHash,
      handle: "marcus_torque",
      name: "Marcus Cole",
      bio: "Independent tech — brakes, suspension, and the occasional stubborn vacuum leak.",
      location: "Denver, CO",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
  });

  const elena = await prisma.user.upsert({
    where: { email: "elena.lap@demo.carasta.com" },
    create: {
      id: DEMO_USER_IDS.elena,
      email: "elena.lap@demo.carasta.com",
      passwordHash,
      handle: "elena_lap",
      name: "Elena Ruiz",
      bio: "Data + driving — Aim Solo, Harry's LapTimer, and too many spreadsheets.",
      location: "San Diego, CA",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
    update: {
      passwordHash,
      handle: "elena_lap",
      name: "Elena Ruiz",
      bio: "Data + driving — Aim Solo, Harry's LapTimer, and too many spreadsheets.",
      location: "San Diego, CA",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
  });

  const kai = await prisma.user.upsert({
    where: { email: "kai.horo@demo.carasta.com" },
    create: {
      id: DEMO_USER_IDS.kai,
      email: "kai.horo@demo.carasta.com",
      passwordHash,
      handle: "kai_horo",
      name: "Kai Okada",
      bio: "Motorsport-adjacent collector — watches, gloves, and cars that still have three pedals.",
      location: "Toronto, ON",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
    update: {
      passwordHash,
      handle: "kai_horo",
      name: "Kai Okada",
      bio: "Motorsport-adjacent collector — watches, gloves, and cars that still have three pedals.",
      location: "Toronto, ON",
      avatarUrl: AVATAR,
      isDemoSeed: true,
      acceptedTermsAt: consentAt,
      acceptedPrivacyAt: consentAt,
      acceptedCommunityGuidelinesAt: consentAt,
    },
  });

  const t0 = new Date("2026-04-10T15:30:00.000Z");
  const t1 = new Date("2026-04-11T09:10:00.000Z");
  const t2 = new Date("2026-04-12T18:45:00.000Z");

  await prisma.forumThread.upsert({
    where: { id: DEMO_THREAD_IDS.hpde },
    create: {
      id: DEMO_THREAD_IDS.hpde,
      categoryId: catGeneral.id,
      authorId: nina.id,
      title: "First HPDE weekend of the season — what am I forgetting?",
      body:
        "Signed up for Saturday intermediate at MSR Cresson. Car is tech’d, numbers are on, brake fluid is fresh (Castrol SRF), and I packed a torque wrench for wheels. Anything you always bring that isn’t on the usual checklists?",
      replyCount: 2,
      lastActivityAt: t2,
      locked: false,
      isDemoSeed: true,
      createdAt: t0,
    },
    update: {
      categoryId: catGeneral.id,
      authorId: nina.id,
      title: "First HPDE weekend of the season — what am I forgetting?",
      body:
        "Signed up for Saturday intermediate at MSR Cresson. Car is tech’d, numbers are on, brake fluid is fresh (Castrol SRF), and I packed a torque wrench for wheels. Anything you always bring that isn’t on the usual checklists?",
      replyCount: 2,
      lastActivityAt: t2,
      isDemoSeed: true,
    },
  });

  await prisma.forumThread.upsert({
    where: { id: DEMO_THREAD_IDS.idle },
    create: {
      id: DEMO_THREAD_IDS.idle,
      categoryId: catDiag.id,
      authorId: marcus.id,
      title: "Intermittent idle dip after cold start (E9x N54)",
      body:
        "Cold start idle hunts for ~20 seconds then settles. No codes stored. HPFP and injectors were done 8k ago. Spark plugs look fine. Where would you look next — vacuum smoke, crankcase vent, or Vanos solenoids first?",
      replyCount: 2,
      lastActivityAt: t2,
      locked: false,
      isDemoSeed: true,
      createdAt: t1,
    },
    update: {
      categoryId: catDiag.id,
      authorId: marcus.id,
      title: "Intermittent idle dip after cold start (E9x N54)",
      body:
        "Cold start idle hunts for ~20 seconds then settles. No codes stored. HPFP and injectors were done 8k ago. Spark plugs look fine. Where would you look next — vacuum smoke, crankcase vent, or Vanos solenoids first?",
      replyCount: 2,
      lastActivityAt: t2,
      isDemoSeed: true,
    },
  });

  await prisma.forumThread.upsert({
    where: { id: DEMO_THREAD_IDS.watches },
    create: {
      id: DEMO_THREAD_IDS.watches,
      categoryId: catWatches.id,
      authorId: kai.id,
      title: "Daily-driver watches that survive track gloves?",
      body:
        "I wear thin gloves on track days and keep a beater field watch for timing. Looking for something readable at a glance, 200m WR, and a bracelet that doesn’t cheese-grate my wrist under Nomex. What are you wearing between sessions?",
      replyCount: 2,
      lastActivityAt: t2,
      locked: false,
      isDemoSeed: true,
      createdAt: t1,
    },
    update: {
      categoryId: catWatches.id,
      authorId: kai.id,
      title: "Daily-driver watches that survive track gloves?",
      body:
        "I wear thin gloves on track days and keep a beater field watch for timing. Looking for something readable at a glance, 200m WR, and a bracelet that doesn’t cheese-grate my wrist under Nomex. What are you wearing between sessions?",
      replyCount: 2,
      lastActivityAt: t2,
      isDemoSeed: true,
    },
  });

  const rHpdeMarcus = new Date("2026-04-10T16:05:00.000Z");
  const rHpdeElena = new Date("2026-04-10T17:20:00.000Z");
  const rIdleNina = new Date("2026-04-11T11:40:00.000Z");
  const rIdleKai = new Date("2026-04-11T20:15:00.000Z");
  const rWatchElena = new Date("2026-04-12T10:05:00.000Z");
  const rWatchNina = new Date("2026-04-12T12:30:00.000Z");

  await prisma.forumReply.upsert({
    where: { id: DEMO_REPLY_IDS.hpde_marcus },
    create: {
      id: DEMO_REPLY_IDS.hpde_marcus,
      threadId: DEMO_THREAD_IDS.hpde,
      authorId: marcus.id,
      body:
        "Zip ties + spare camera mount, painter’s tape for small fixes, and a sharpie that actually works. Also: paper towels live in a ziplock so they stay dry.",
      isDemoSeed: true,
      createdAt: rHpdeMarcus,
    },
    update: {
      threadId: DEMO_THREAD_IDS.hpde,
      authorId: marcus.id,
      body:
        "Zip ties + spare camera mount, painter’s tape for small fixes, and a sharpie that actually works. Also: paper towels live in a ziplock so they stay dry.",
      isDemoSeed: true,
    },
  });

  await prisma.forumReply.upsert({
    where: { id: DEMO_REPLY_IDS.hpde_elena },
    create: {
      id: DEMO_REPLY_IDS.hpde_elena,
      threadId: DEMO_THREAD_IDS.hpde,
      authorId: elena.id,
      body:
        "If you’re logging laps: confirm sample rate on your GPS before the first session, and screenshot your baseline temps after session 1. Makes “something felt off” way easier to diagnose later.",
      isDemoSeed: true,
      createdAt: rHpdeElena,
    },
    update: {
      threadId: DEMO_THREAD_IDS.hpde,
      authorId: elena.id,
      body:
        "If you’re logging laps: confirm sample rate on your GPS before the first session, and screenshot your baseline temps after session 1. Makes “something felt off” way easier to diagnose later.",
      isDemoSeed: true,
    },
  });

  await prisma.forumReply.upsert({
    where: { id: DEMO_REPLY_IDS.idle_nina },
    create: {
      id: DEMO_REPLY_IDS.idle_nina,
      threadId: DEMO_THREAD_IDS.idle,
      authorId: nina.id,
      body:
        "I’d smoke the intake and crankcase vent path first on these — small leaks show up as weird cold-start behavior before they throw lean codes. Log fuel trims on a cold start if you can.",
      isDemoSeed: true,
      createdAt: rIdleNina,
    },
    update: {
      threadId: DEMO_THREAD_IDS.idle,
      authorId: nina.id,
      body:
        "I’d smoke the intake and crankcase vent path first on these — small leaks show up as weird cold-start behavior before they throw lean codes. Log fuel trims on a cold start if you can.",
      isDemoSeed: true,
    },
  });

  await prisma.forumReply.upsert({
    where: { id: DEMO_REPLY_IDS.idle_kai },
    create: {
      id: DEMO_REPLY_IDS.idle_kai,
      threadId: DEMO_THREAD_IDS.idle,
      authorId: kai.id,
      body:
        "If it only happens cold, I’d still pull Vanos solenoids and inspect the screens — cheap sanity check before you chase ghosts. Also worth confirming the battery is healthy; low voltage does weird things on these ECUs.",
      isDemoSeed: true,
      createdAt: rIdleKai,
    },
    update: {
      threadId: DEMO_THREAD_IDS.idle,
      authorId: kai.id,
      body:
        "If it only happens cold, I’d still pull Vanos solenoids and inspect the screens — cheap sanity check before you chase ghosts. Also worth confirming the battery is healthy; low voltage does weird things on these ECUs.",
      isDemoSeed: true,
    },
  });

  await prisma.forumReply.upsert({
    where: { id: DEMO_REPLY_IDS.watches_elena },
    create: {
      id: DEMO_REPLY_IDS.watches_elena,
      threadId: DEMO_THREAD_IDS.watches,
      authorId: elena.id,
      body:
        "Titanium bracelet + fitted rubber strap in the bag. I swap after cool-down so I’m not scratching Nomex or roasting metal in direct sun. Legibility > hype.",
      isDemoSeed: true,
      createdAt: rWatchElena,
    },
    update: {
      threadId: DEMO_THREAD_IDS.watches,
      authorId: elena.id,
      body:
        "Titanium bracelet + fitted rubber strap in the bag. I swap after cool-down so I’m not scratching Nomex or roasting metal in direct sun. Legibility > hype.",
      isDemoSeed: true,
    },
  });

  await prisma.forumReply.upsert({
    where: { id: DEMO_REPLY_IDS.watches_nina },
    create: {
      id: DEMO_REPLY_IDS.watches_nina,
      threadId: DEMO_THREAD_IDS.watches,
      authorId: nina.id,
      body:
        "Quartz beater on a NATO for the paddock, nothing precious on wrist during sessions. I learned that after a ceramic bezel met concrete in grid traffic…",
      isDemoSeed: true,
      createdAt: rWatchNina,
    },
    update: {
      threadId: DEMO_THREAD_IDS.watches,
      authorId: nina.id,
      body:
        "Quartz beater on a NATO for the paddock, nothing precious on wrist during sessions. I learned that after a ceramic bezel met concrete in grid traffic…",
      isDemoSeed: true,
    },
  });

  console.log(
    "[demo-discussions] Ensured demo users + threads:",
    nina.handle,
    marcus.handle,
    elena.handle,
    kai.handle
  );
}
