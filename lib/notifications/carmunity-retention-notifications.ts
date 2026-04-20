import type { PrismaClient } from "@prisma/client";

import { recipientHasMutedActor, usersAreBlockedEitherWay } from "@/lib/user-safety";

export const RETENTION_NOTIFICATION_TYPES = {
  USER_FOLLOW: "USER_FOLLOW",
  SUBSCRIBED_THREAD_REPLY: "SUBSCRIBED_THREAD_REPLY",
} as const;

function payloadString(p: Record<string, unknown>): string {
  return JSON.stringify(p);
}

async function hasRecentFollowNotify(
  prisma: PrismaClient,
  input: { recipientId: string; actorId: string; since: Date }
): Promise<boolean> {
  const found = await prisma.notification.findFirst({
    where: {
      userId: input.recipientId,
      type: RETENTION_NOTIFICATION_TYPES.USER_FOLLOW,
      actorId: input.actorId,
      createdAt: { gte: input.since },
    },
    select: { id: true },
  });
  return Boolean(found);
}

/** Notifies the followed user (respects mute + block). Light dedupe (24h). */
export async function notifyUserFollowed(input: {
  prisma: PrismaClient;
  recipientId: string;
  actorId: string;
  actorHandle: string;
  actorName: string | null;
}): Promise<void> {
  if (input.recipientId === input.actorId) return;
  if (await usersAreBlockedEitherWay(input.prisma, input.recipientId, input.actorId)) return;
  if (await recipientHasMutedActor(input.prisma, input.recipientId, input.actorId)) return;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (await hasRecentFollowNotify(input.prisma, { ...input, since })) return;

  const href = `/u/${input.actorHandle}`;
  await input.prisma.notification.create({
    data: {
      userId: input.recipientId,
      actorId: input.actorId,
      targetId: `follow:${input.actorId}`,
      type: RETENTION_NOTIFICATION_TYPES.USER_FOLLOW,
      payloadJson: payloadString({
        title: `${input.actorHandle} started following you`,
        href,
      }),
    },
  });
}

/** Notifies thread subscribers about a new reply (not OP for direct replies — they get THREAD_REPLY). */
export async function notifySubscribedThreadNewReply(input: {
  prisma: PrismaClient;
  threadId: string;
  replyId: string;
  actorId: string;
  threadAuthorId: string;
  /** Top-level reply to thread (no parent). */
  isDirectThreadReply: boolean;
  gearSlug: string;
  lowerGearSlug: string;
  threadTitle: string;
  actorHandle: string;
  actorName: string | null;
}): Promise<void> {
  const subs = await input.prisma.forumThreadSubscription.findMany({
    where: { threadId: input.threadId, userId: { not: input.actorId } },
    select: { userId: true },
  });
  if (subs.length === 0) return;

  const href = `/discussions/${input.gearSlug}/${input.lowerGearSlug}/${input.threadId}`;

  for (const { userId } of subs) {
    if (input.isDirectThreadReply && userId === input.threadAuthorId) {
      continue;
    }
    if (await usersAreBlockedEitherWay(input.prisma, userId, input.actorId)) continue;
    if (await recipientHasMutedActor(input.prisma, userId, input.actorId)) continue;

    const targetId = `${input.threadId}:${input.replyId}:${userId}`;
    const dup = await input.prisma.notification.findFirst({
      where: {
        userId,
        type: RETENTION_NOTIFICATION_TYPES.SUBSCRIBED_THREAD_REPLY,
        targetId,
      },
      select: { id: true },
    });
    if (dup) continue;

    await input.prisma.notification.create({
      data: {
        userId,
        actorId: input.actorId,
        targetId,
        type: RETENTION_NOTIFICATION_TYPES.SUBSCRIBED_THREAD_REPLY,
        payloadJson: payloadString({
          title: `New reply in “${input.threadTitle.slice(0, 80)}${input.threadTitle.length > 80 ? "…" : ""}”`,
          message: `@${input.actorHandle} replied`,
          href,
          threadId: input.threadId,
          replyId: input.replyId,
          gearSlug: input.gearSlug,
          lowerGearSlug: input.lowerGearSlug,
        }),
      },
    });
  }
}
