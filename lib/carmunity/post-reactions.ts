import type { DiscussionReactionKind, PrismaClient } from "@prisma/client";

import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";

function emptySummary(): DiscussionReactionTotals {
  return { total: 0, byKind: {} };
}

/** Aggregate PostReaction rows + legacy Like rows (users without a PostReaction row). */
export async function summarizePostReactionsMerged(
  prisma: PrismaClient,
  postIds: string[]
): Promise<Map<string, DiscussionReactionTotals>> {
  const map = new Map<string, DiscussionReactionTotals>();
  if (postIds.length === 0) return map;
  for (const id of postIds) map.set(id, emptySummary());

  const grouped = await prisma.postReaction.groupBy({
    by: ["postId", "kind"],
    where: { postId: { in: postIds } },
    _count: { _all: true },
  });
  for (const row of grouped) {
    const cur = map.get(row.postId) ?? emptySummary();
    const n = row._count._all;
    cur.byKind[row.kind] = (cur.byKind[row.kind] ?? 0) + n;
    cur.total += n;
    map.set(row.postId, cur);
  }

  const legacy = await prisma.like.findMany({
    where: { postId: { in: postIds } },
    select: { postId: true, userId: true },
  });
  if (legacy.length === 0) return map;

  const reacted = await prisma.postReaction.findMany({
    where: { postId: { in: postIds } },
    select: { postId: true, userId: true },
  });
  const reactedSet = new Set(reacted.map((r) => `${r.postId}:${r.userId}`));

  for (const l of legacy) {
    if (reactedSet.has(`${l.postId}:${l.userId}`)) continue;
    const cur = map.get(l.postId) ?? emptySummary();
    cur.byKind.LIKE = (cur.byKind.LIKE ?? 0) + 1;
    cur.total += 1;
    map.set(l.postId, cur);
  }

  return map;
}

export async function viewerPostReactionKinds(
  prisma: PrismaClient,
  viewerId: string | null | undefined,
  postIds: string[]
): Promise<Map<string, DiscussionReactionKind | null>> {
  const out = new Map<string, DiscussionReactionKind | null>();
  for (const id of postIds) out.set(id, null);
  if (!viewerId || postIds.length === 0) return out;

  const rows = await prisma.postReaction.findMany({
    where: { userId: viewerId, postId: { in: postIds } },
    select: { postId: true, kind: true },
  });
  for (const r of rows) out.set(r.postId, r.kind);

  const missing = postIds.filter((id) => !rows.some((r) => r.postId === id));
  if (missing.length === 0) return out;

  const likes = await prisma.like.findMany({
    where: { userId: viewerId, postId: { in: missing } },
    select: { postId: true },
  });
  for (const l of likes) {
    if (out.get(l.postId) == null) out.set(l.postId, "LIKE");
  }

  return out;
}

export async function upsertPostReaction(input: {
  prisma: PrismaClient;
  userId: string;
  postId: string;
  kind: DiscussionReactionKind;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const post = await input.prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  await input.prisma.postReaction.upsert({
    where: {
      postId_userId: { postId: input.postId, userId: input.userId },
    },
    create: {
      postId: input.postId,
      userId: input.userId,
      kind: input.kind,
    },
    update: { kind: input.kind },
  });

  if (input.kind === "LIKE") {
    await input.prisma.like.upsert({
      where: {
        userId_postId: { userId: input.userId, postId: input.postId },
      },
      create: { userId: input.userId, postId: input.postId },
      update: {},
    });
  } else {
    await input.prisma.like.deleteMany({
      where: { userId: input.userId, postId: input.postId },
    });
  }

  return { ok: true };
}

export async function removePostReaction(input: {
  prisma: PrismaClient;
  userId: string;
  postId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const post = await input.prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  await input.prisma.postReaction.deleteMany({
    where: { postId: input.postId, userId: input.userId },
  });
  await input.prisma.like.deleteMany({
    where: { postId: input.postId, userId: input.userId },
  });

  return { ok: true };
}
