import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  listSuggestedDiscussionUsers,
  type SuggestedUserRow,
} from "@/lib/forums/discussions-discovery";
import {
  listDiscoveryThreadMixForViewer,
  listSuggestedDiscussionUsersForViewer,
} from "@/lib/forums/discussion-recommendations";

export type OnboardingStarterThread = {
  id: string;
  title: string;
  gearSlug: string;
  lowerGearSlug: string;
};

export type CarmunityInterestPrefs = {
  gearSlugs?: string[];
  lowerCategories?: Array<{ spaceSlug: string; slug: string }>;
};

export type OnboardingSpaceOption = {
  slug: string;
  title: string;
  categories: Array<{ slug: string; title: string }>;
};

export type OnboardingPack = {
  spaces: OnboardingSpaceOption[];
  suggestedUsers: SuggestedUserRow[];
  starterThreads: OnboardingStarterThread[];
  /** Pre-fill chips when revisiting onboarding (prefs stay on the user). */
  initialGearSlugs?: string[];
  initialLowerCategories?: Array<{ spaceSlug: string; slug: string }>;
};

export async function listOnboardingSpaceOptions(): Promise<OnboardingSpaceOption[]> {
  const rows = await prisma.forumSpace.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      title: true,
      categories: {
        orderBy: { sortOrder: "asc" },
        take: 24,
        select: { slug: true, title: true },
      },
    },
  });
  return rows.map((s) => ({
    slug: s.slug,
    title: s.title,
    categories: s.categories.map((c) => ({ slug: c.slug, title: c.title })),
  }));
}

export async function buildOnboardingPack(input: { viewerUserId: string | null }): Promise<OnboardingPack> {
  const [spaces, suggestedUsers, mixRows, st] = await Promise.all([
    listOnboardingSpaceOptions(),
    input.viewerUserId
      ? listSuggestedDiscussionUsersForViewer({ viewerId: input.viewerUserId, take: 8 }).catch(() => [])
      : listSuggestedDiscussionUsers({ take: 8, excludeUserId: null }).catch(() => []),
    listDiscoveryThreadMixForViewer(input.viewerUserId, { take: 6 }).catch(() => []),
    input.viewerUserId ? getCarmunityOnboardingState(input.viewerUserId) : Promise.resolve(null),
  ]);
  const starterThreads: OnboardingStarterThread[] = mixRows.map((t) => ({
    id: t.id,
    title: t.title,
    gearSlug: t.gearSlug,
    lowerGearSlug: t.lowerGearSlug,
  }));
  return {
    spaces,
    suggestedUsers,
    starterThreads,
    initialGearSlugs: st?.prefs.gearSlugs,
    initialLowerCategories: st?.prefs.lowerCategories,
  };
}

function parsePrefs(raw: Prisma.JsonValue | null): CarmunityInterestPrefs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const gearSlugs = Array.isArray(o.gearSlugs)
    ? o.gearSlugs.filter((x): x is string => typeof x === "string")
    : undefined;
  const lowerCategories = Array.isArray(o.lowerCategories)
    ? o.lowerCategories
        .map((x) => {
          if (!x || typeof x !== "object" || Array.isArray(x)) return null;
          const r = x as Record<string, unknown>;
          if (typeof r.spaceSlug !== "string" || typeof r.slug !== "string") return null;
          return { spaceSlug: r.spaceSlug, slug: r.slug };
        })
        .filter((x): x is { spaceSlug: string; slug: string } => Boolean(x))
    : undefined;
  return { gearSlugs, lowerCategories };
}

export async function getCarmunityOnboardingState(userId: string): Promise<{
  completedAt: Date | null;
  prefs: CarmunityInterestPrefs;
}> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { carmunityOnboardingCompletedAt: true, carmunityInterestPrefs: true },
  });
  return {
    completedAt: row?.carmunityOnboardingCompletedAt ?? null,
    prefs: parsePrefs(row?.carmunityInterestPrefs ?? null),
  };
}

export async function saveCarmunityOnboardingPrefs(input: {
  userId: string;
  prefs: Partial<CarmunityInterestPrefs>;
}): Promise<void> {
  const merged = await getCarmunityOnboardingState(input.userId);
  const next: CarmunityInterestPrefs = {
    gearSlugs: input.prefs.gearSlugs ?? merged.prefs.gearSlugs,
    lowerCategories: input.prefs.lowerCategories ?? merged.prefs.lowerCategories,
  };
  await prisma.user.update({
    where: { id: input.userId },
    data: { carmunityInterestPrefs: next as unknown as Prisma.InputJsonValue },
  });
}

export async function completeCarmunityOnboarding(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { carmunityOnboardingCompletedAt: new Date() },
  });
}

export async function resetCarmunityOnboarding(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { carmunityOnboardingCompletedAt: null },
  });
}
