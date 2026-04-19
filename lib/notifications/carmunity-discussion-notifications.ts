import type { DiscussionReactionKind, PrismaClient } from "@prisma/client";

export const CARMUNITY_NOTIFICATION_TYPES = {
  THREAD_REPLY: "THREAD_REPLY",
  REPLY_REPLY: "REPLY_REPLY",
  REACTION: "REACTION",
  MENTION: "MENTION",
} as const;

export type CarmunityNotificationType =
  (typeof CARMUNITY_NOTIFICATION_TYPES)[keyof typeof CARMUNITY_NOTIFICATION_TYPES];

export type DiscussionNotificationPayload = {
  title: string;
  message?: string;
  href: string;
  threadId: string;
  replyId?: string;
  gearSlug: string;
  lowerGearSlug: string;
  actorHandle: string;
  actorName?: string | null;
  reactionKind?: DiscussionReactionKind;
};

function payloadString(p: DiscussionNotificationPayload): string {
  return JSON.stringify(p);
}

async function hasRecentDuplicate(
  prisma: PrismaClient,
  input: {
    recipientId: string;
    type: CarmunityNotificationType;
    actorId: string | null;
    targetId: string | null;
    since: Date;
  }
): Promise<boolean> {
  const found = await prisma.notification.findFirst({
    where: {
      userId: input.recipientId,
      type: input.type,
      actorId: input.actorId,
      targetId: input.targetId,
      createdAt: { gte: input.since },
    },
    select: { id: true },
  });
  return Boolean(found);
}

export async function notifyThreadReply(input: {
  prisma: PrismaClient;
  recipientId: string;
  actorId: string;
  threadId: string;
  replyId: string;
  gearSlug: string;
  lowerGearSlug: string;
  actorHandle: string;
  actorName: string | null;
  threadTitle: string;
}): Promise<void> {
  if (input.recipientId === input.actorId) return;
  const href = `/discussions/${input.gearSlug}/${input.lowerGearSlug}/${input.threadId}`;
  const payload: DiscussionNotificationPayload = {
    title: `${input.actorHandle} replied to your thread`,
    message: input.threadTitle.slice(0, 120),
    href,
    threadId: input.threadId,
    replyId: input.replyId,
    gearSlug: input.gearSlug,
    lowerGearSlug: input.lowerGearSlug,
    actorHandle: input.actorHandle,
    actorName: input.actorName,
  };
  await input.prisma.notification.create({
    data: {
      userId: input.recipientId,
      actorId: input.actorId,
      targetId: input.replyId,
      type: CARMUNITY_NOTIFICATION_TYPES.THREAD_REPLY,
      payloadJson: payloadString(payload),
    },
  });
}

export async function notifyReplyToReply(input: {
  prisma: PrismaClient;
  recipientId: string;
  actorId: string;
  threadId: string;
  replyId: string;
  gearSlug: string;
  lowerGearSlug: string;
  actorHandle: string;
  actorName: string | null;
  parentSnippet: string;
}): Promise<void> {
  if (input.recipientId === input.actorId) return;
  const href = `/discussions/${input.gearSlug}/${input.lowerGearSlug}/${input.threadId}`;
  const payload: DiscussionNotificationPayload = {
    title: `${input.actorHandle} replied to your comment`,
    message: input.parentSnippet.slice(0, 120),
    href,
    threadId: input.threadId,
    replyId: input.replyId,
    gearSlug: input.gearSlug,
    lowerGearSlug: input.lowerGearSlug,
    actorHandle: input.actorHandle,
    actorName: input.actorName,
  };
  await input.prisma.notification.create({
    data: {
      userId: input.recipientId,
      actorId: input.actorId,
      targetId: input.replyId,
      type: CARMUNITY_NOTIFICATION_TYPES.REPLY_REPLY,
      payloadJson: payloadString(payload),
    },
  });
}

export async function notifyReaction(input: {
  prisma: PrismaClient;
  recipientId: string;
  actorId: string;
  targetId: string;
  threadId: string;
  gearSlug: string;
  lowerGearSlug: string;
  actorHandle: string;
  actorName: string | null;
  kind: DiscussionReactionKind;
  onReply: boolean;
}): Promise<void> {
  if (input.recipientId === input.actorId) return;
  const since = new Date(Date.now() - 10 * 60 * 1000);
  if (
    await hasRecentDuplicate(input.prisma, {
      recipientId: input.recipientId,
      type: CARMUNITY_NOTIFICATION_TYPES.REACTION,
      actorId: input.actorId,
      targetId: input.targetId,
      since,
    })
  ) {
    return;
  }
  const href = `/discussions/${input.gearSlug}/${input.lowerGearSlug}/${input.threadId}`;
  const payload: DiscussionNotificationPayload = {
    title: `${input.actorHandle} reacted to your ${input.onReply ? "reply" : "thread"}`,
    href,
    threadId: input.threadId,
    gearSlug: input.gearSlug,
    lowerGearSlug: input.lowerGearSlug,
    actorHandle: input.actorHandle,
    actorName: input.actorName,
    reactionKind: input.kind,
  };
  await input.prisma.notification.create({
    data: {
      userId: input.recipientId,
      actorId: input.actorId,
      targetId: input.targetId,
      type: CARMUNITY_NOTIFICATION_TYPES.REACTION,
      payloadJson: payloadString(payload),
    },
  });
}

export async function notifyMention(input: {
  prisma: PrismaClient;
  recipientId: string;
  actorId: string;
  threadId: string;
  replyId?: string;
  gearSlug: string;
  lowerGearSlug: string;
  actorHandle: string;
  actorName: string | null;
  snippet: string;
}): Promise<void> {
  if (input.recipientId === input.actorId) return;
  const since = new Date(Date.now() - 2 * 60 * 1000);
  const targetId = `${input.threadId}:${input.replyId ?? "op"}:${input.recipientId}`;
  if (
    await hasRecentDuplicate(input.prisma, {
      recipientId: input.recipientId,
      type: CARMUNITY_NOTIFICATION_TYPES.MENTION,
      actorId: input.actorId,
      targetId,
      since,
    })
  ) {
    return;
  }
  const href = `/discussions/${input.gearSlug}/${input.lowerGearSlug}/${input.threadId}`;
  const payload: DiscussionNotificationPayload = {
    title: `${input.actorHandle} mentioned you`,
    message: input.snippet.slice(0, 160),
    href,
    threadId: input.threadId,
    replyId: input.replyId,
    gearSlug: input.gearSlug,
    lowerGearSlug: input.lowerGearSlug,
    actorHandle: input.actorHandle,
    actorName: input.actorName,
  };
  await input.prisma.notification.create({
    data: {
      userId: input.recipientId,
      actorId: input.actorId,
      targetId,
      type: CARMUNITY_NOTIFICATION_TYPES.MENTION,
      payloadJson: payloadString(payload),
    },
  });
}
