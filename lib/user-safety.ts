import type { PrismaClient } from "@prisma/client";

export async function listBlockedUserIdsForBlocker(
  prisma: PrismaClient,
  blockerId: string
): Promise<string[]> {
  const rows = await prisma.userBlock.findMany({
    where: { blockerId },
    select: { blockedId: true },
  });
  return rows.map((r) => r.blockedId);
}

export async function viewerBlocksUserId(
  prisma: PrismaClient,
  viewerId: string | null | undefined,
  targetUserId: string
): Promise<boolean> {
  if (!viewerId || viewerId === targetUserId) return false;
  const row = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: { blockerId: viewerId, blockedId: targetUserId },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function recipientHasMutedActor(
  prisma: PrismaClient,
  recipientId: string,
  actorId: string
): Promise<boolean> {
  if (recipientId === actorId) return false;
  const row = await prisma.userMute.findUnique({
    where: {
      userId_mutedUserId: { userId: recipientId, mutedUserId: actorId },
    },
    select: { id: true },
  });
  return Boolean(row);
}

/** True if either user has blocked the other (Phase H + social rules). */
export async function usersAreBlockedEitherWay(
  prisma: PrismaClient,
  userIdA: string,
  userIdB: string
): Promise<boolean> {
  if (userIdA === userIdB) return false;
  const row = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userIdA, blockedId: userIdB },
        { blockerId: userIdB, blockedId: userIdA },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
}

/**
 * Among `candidateIds`, returns user ids the viewer should not see as a social peer
 * (either direction block). Empty when signed out.
 */
export async function peerUserIdsHiddenFromViewer(
  prisma: PrismaClient,
  viewerId: string | null | undefined,
  candidateIds: string[]
): Promise<Set<string>> {
  const hidden = new Set<string>();
  if (!viewerId || candidateIds.length === 0) return hidden;
  const uniq = Array.from(new Set(candidateIds)).filter((id) => id && id !== viewerId);
  if (uniq.length === 0) return hidden;

  const rows = await prisma.userBlock.findMany({
    where: {
      OR: [
        { blockerId: viewerId, blockedId: { in: uniq } },
        { blockerId: { in: uniq }, blockedId: viewerId },
      ],
    },
    select: { blockerId: true, blockedId: true },
  });
  for (const r of rows) {
    if (r.blockerId === viewerId) hidden.add(r.blockedId);
    else hidden.add(r.blockerId);
  }
  return hidden;
}
