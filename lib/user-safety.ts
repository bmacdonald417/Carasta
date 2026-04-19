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
