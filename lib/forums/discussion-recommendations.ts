import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { peerUserIdsHiddenFromViewer } from "@/lib/user-safety";
import {
  listSuggestedDiscussionUsers,
  listThreadsForPreferredGears,
  listTrendingThreadsGlobal,
  type SuggestedUserRow,
  type TrendingThreadRow,
} from "@/lib/forums/discussions-discovery";

function gearSlugsFromUserPrefs(raw: Prisma.JsonValue | null | undefined): string[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const o = raw as Record<string, unknown>;
  const gearSlugs = Array.isArray(o.gearSlugs)
    ? o.gearSlugs.filter((x): x is string => typeof x === "string")
    : [];
  return Array.from(new Set(gearSlugs.filter(Boolean)));
}

/** Users active in viewer’s preferred Gears (last 30d), distinct ids. */
async function userIdsActiveInGearSlugs(gearSlugs: string[]): Promise<Set<string>> {
  if (gearSlugs.length === 0) return new Set();
  const rows = await prisma.forumThread.findMany({
    where: {
      isHidden: false,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      category: { space: { slug: { in: gearSlugs }, isActive: true } },
    },
    distinct: ["authorId"],
    select: { authorId: true },
    take: 200,
  });
  const fromThreads = rows.map((r) => r.authorId);
  const replyRows = await prisma.forumReply.findMany({
    where: {
      isHidden: false,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      thread: {
        isHidden: false,
        category: { space: { slug: { in: gearSlugs }, isActive: true } },
      },
    },
    distinct: ["authorId"],
    select: { authorId: true },
    take: 200,
  });
  const fromReplies = replyRows.map((r) => r.authorId);
  return new Set([...fromThreads, ...fromReplies]);
}

/**
 * Suggested discussion users for a signed-in viewer:
 * excludes self, followed, and either-direction blocks; boosts same-Gear activity.
 */
export async function listSuggestedDiscussionUsersForViewer(input: {
  viewerId: string;
  take?: number;
}): Promise<SuggestedUserRow[]> {
  const take = Math.min(Math.max(input.take ?? 8, 1), 12);
  const prefsRow = await prisma.user.findUnique({
    where: { id: input.viewerId },
    select: { carmunityInterestPrefs: true },
  });
  const gearSlugs = gearSlugsFromUserPrefs(prefsRow?.carmunityInterestPrefs ?? null);

  const [followingRows, baseCandidates] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: input.viewerId },
      select: { followingId: true },
    }),
    listSuggestedDiscussionUsers({ take: 32, excludeUserId: input.viewerId }),
  ]);
  const following = new Set(followingRows.map((f) => f.followingId));
  const inGear = await userIdsActiveInGearSlugs(gearSlugs);

  const ids = baseCandidates.map((c) => c.id);
  const hidden = await peerUserIdsHiddenFromViewer(prisma, input.viewerId, ids);

  const filtered = baseCandidates.filter((u) => !hidden.has(u.id) && !following.has(u.id));

  filtered.sort((a, b) => {
    const ag = gearSlugs.length && inGear.has(a.id) ? 1 : 0;
    const bg = gearSlugs.length && inGear.has(b.id) ? 1 : 0;
    if (ag !== bg) return bg - ag;
    return b.activityScore - a.activityScore;
  });

  return filtered.slice(0, take);
}

/** Merge preferred-Gear threads with global trending; de-dupe by thread id; cap length. */
export async function listDiscoveryThreadMix(input: {
  gearSlugs: string[];
  take?: number;
}): Promise<TrendingThreadRow[]> {
  const take = Math.min(Math.max(input.take ?? 8, 1), 16);
  const [gearThreads, trending] = await Promise.all([
    input.gearSlugs.length > 0
      ? listThreadsForPreferredGears({ gearSlugs: input.gearSlugs, take: Math.ceil(take * 0.65) })
      : Promise.resolve([] as TrendingThreadRow[]),
    listTrendingThreadsGlobal({ take: Math.ceil(take * 0.65) }),
  ]);
  const seen = new Set<string>();
  const out: TrendingThreadRow[] = [];
  for (const t of [...gearThreads, ...trending]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
    if (out.length >= take) break;
  }
  return out;
}

export async function listDiscoveryThreadMixForViewer(
  viewerId: string | null,
  input?: { take?: number }
): Promise<TrendingThreadRow[]> {
  const take = input?.take;
  let gearSlugs: string[] = [];
  if (viewerId) {
    const row = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { carmunityInterestPrefs: true },
    });
    gearSlugs = gearSlugsFromUserPrefs(row?.carmunityInterestPrefs ?? null);
  }
  return listDiscoveryThreadMix({ gearSlugs, take });
}
