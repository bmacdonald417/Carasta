import type { DiscussionReactionKind, PrismaClient } from "@prisma/client";

import { notifyReaction } from "@/lib/notifications/carmunity-discussion-notifications";

export type DiscussionReactionTarget = "thread" | "reply";

export async function upsertDiscussionReaction(input: {
  prisma: PrismaClient;
  userId: string;
  target: DiscussionReactionTarget;
  targetId: string;
  kind: DiscussionReactionKind;
}): Promise<
  { ok: true; kind: DiscussionReactionKind } | { ok: false; error: string }
> {
  if (input.target === "thread") {
    const thread = await input.prisma.forumThread.findUnique({
      where: { id: input.targetId },
      select: {
        id: true,
        authorId: true,
        isHidden: true,
        category: {
          select: { slug: true, space: { select: { slug: true } } },
        },
      },
    });
    if (!thread) return { ok: false, error: "Thread not found." };
    if (thread.isHidden) return { ok: false, error: "This thread is not available." };

    const row = await input.prisma.forumThreadReaction.upsert({
      where: {
        threadId_userId: { threadId: input.targetId, userId: input.userId },
      },
      create: {
        threadId: input.targetId,
        userId: input.userId,
        kind: input.kind,
      },
      update: { kind: input.kind },
      select: { kind: true },
    });

    if (thread.authorId !== input.userId) {
      const actor = await input.prisma.user.findUnique({
        where: { id: input.userId },
        select: { handle: true, name: true },
      });
      if (actor) {
        await notifyReaction({
          prisma: input.prisma,
          recipientId: thread.authorId,
          actorId: input.userId,
          targetId: input.targetId,
          threadId: thread.id,
          gearSlug: thread.category.space.slug,
          lowerGearSlug: thread.category.slug,
          actorHandle: actor.handle,
          actorName: actor.name,
          kind: row.kind,
          onReply: false,
        });
      }
    }

    return { ok: true, kind: row.kind };
  }

  const reply = await input.prisma.forumReply.findUnique({
    where: { id: input.targetId },
    select: {
      id: true,
      authorId: true,
      threadId: true,
      isHidden: true,
      thread: {
        select: {
          id: true,
          isHidden: true,
          category: { select: { slug: true, space: { select: { slug: true } } } },
        },
      },
    },
  });
  if (!reply) return { ok: false, error: "Reply not found." };
  if (reply.isHidden || reply.thread.isHidden) {
    return { ok: false, error: "This content is not available." };
  }

  const row = await input.prisma.forumReplyReaction.upsert({
    where: {
      replyId_userId: { replyId: input.targetId, userId: input.userId },
    },
    create: {
      replyId: input.targetId,
      userId: input.userId,
      kind: input.kind,
    },
    update: { kind: input.kind },
    select: { kind: true },
  });

  if (reply.authorId !== input.userId) {
    const actor = await input.prisma.user.findUnique({
      where: { id: input.userId },
      select: { handle: true, name: true },
    });
    if (actor) {
      await notifyReaction({
        prisma: input.prisma,
        recipientId: reply.authorId,
        actorId: input.userId,
        targetId: reply.id,
        threadId: reply.thread.id,
        gearSlug: reply.thread.category.space.slug,
        lowerGearSlug: reply.thread.category.slug,
        actorHandle: actor.handle,
        actorName: actor.name,
        kind: row.kind,
        onReply: true,
      });
    }
  }

  return { ok: true, kind: row.kind };
}

export async function removeDiscussionReaction(input: {
  prisma: PrismaClient;
  userId: string;
  target: DiscussionReactionTarget;
  targetId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.target === "thread") {
    const thread = await input.prisma.forumThread.findUnique({
      where: { id: input.targetId },
      select: { id: true, isHidden: true },
    });
    if (!thread) return { ok: false, error: "Thread not found." };
    if (thread.isHidden) return { ok: false, error: "This thread is not available." };
    await input.prisma.forumThreadReaction.deleteMany({
      where: { threadId: input.targetId, userId: input.userId },
    });
    return { ok: true };
  }

  const reply = await input.prisma.forumReply.findUnique({
    where: { id: input.targetId },
    select: {
      id: true,
      isHidden: true,
      thread: { select: { isHidden: true } },
    },
  });
  if (!reply) return { ok: false, error: "Reply not found." };
  if (reply.isHidden || reply.thread.isHidden) {
    return { ok: false, error: "This content is not available." };
  }
  await input.prisma.forumReplyReaction.deleteMany({
    where: { replyId: input.targetId, userId: input.userId },
  });
  return { ok: true };
}
