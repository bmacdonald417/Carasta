import { prisma } from "@/lib/db";

export type CarmunityServiceError = { ok: false; error: string };
export type CarmunityServiceSuccess = { ok: true };
export type CarmunityServiceOk<T extends object> = CarmunityServiceSuccess & T;

/**
 * Shared Carmunity engagement logic for web Server Actions and JSON API routes.
 * No cache revalidation here — callers own presentation side effects.
 */

export async function createCarmunityPost(input: {
  authorId: string;
  content: string | null | undefined;
  imageUrl: string | null | undefined;
}): Promise<CarmunityServiceOk<{ postId: string }> | CarmunityServiceError> {
  const content = input.content?.trim() ?? "";
  const imageUrl = input.imageUrl?.trim() ?? "";
  if (!content && !imageUrl) {
    return { ok: false, error: "Add some text or a photo." };
  }

  const post = await prisma.post.create({
    data: {
      authorId: input.authorId,
      content: content || null,
      imageUrl: imageUrl || null,
    },
    select: { id: true },
  });
  return { ok: true, postId: post.id };
}

export async function likeCarmunityPost(input: {
  userId: string;
  postId: string;
}): Promise<CarmunityServiceOk<{ likeCount: number; liked: true }> | CarmunityServiceError> {
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  await prisma.like.upsert({
    where: {
      userId_postId: { userId: input.userId, postId: input.postId },
    },
    create: { userId: input.userId, postId: input.postId },
    update: {},
  });

  const countRow = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { _count: { select: { likes: true } } },
  });
  return { ok: true, likeCount: countRow?._count.likes ?? 0, liked: true };
}

export async function unlikeCarmunityPost(input: {
  userId: string;
  postId: string;
}): Promise<CarmunityServiceOk<{ likeCount: number; liked: false }> | CarmunityServiceError> {
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  await prisma.like.deleteMany({
    where: { userId: input.userId, postId: input.postId },
  });

  const countRow = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { _count: { select: { likes: true } } },
  });
  return { ok: true, likeCount: countRow?._count.likes ?? 0, liked: false };
}

export async function addCarmunityComment(input: {
  authorId: string;
  postId: string;
  content: string;
}): Promise<
  CarmunityServiceOk<{ commentId: string; commentCount: number }> | CarmunityServiceError
> {
  const trimmed = input.content?.trim() ?? "";
  if (!trimmed) return { ok: false, error: "Comment is required." };

  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  const comment = await prisma.comment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      content: trimmed,
    },
    select: { id: true },
  });

  const { broadcastActivityEvent } = await import("@/lib/pusher");
  broadcastActivityEvent({
    type: "new_comment",
    postId: input.postId,
    label: "New comment in Carmunity",
    timestamp: new Date().toISOString(),
  });

  const countRow = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { _count: { select: { comments: true } } },
  });

  return {
    ok: true,
    commentId: comment.id,
    commentCount: countRow?._count.comments ?? 0,
  };
}

export async function followCarmunityUser(input: {
  followerId: string;
  followingId: string;
}): Promise<CarmunityServiceSuccess | CarmunityServiceError> {
  if (input.followerId === input.followingId) {
    return { ok: false, error: "Cannot follow yourself." };
  }

  const target = await prisma.user.findUnique({
    where: { id: input.followingId },
    select: { id: true },
  });
  if (!target) return { ok: false, error: "User not found." };

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: input.followerId,
        followingId: input.followingId,
      },
    },
    create: { followerId: input.followerId, followingId: input.followingId },
    update: {},
  });
  return { ok: true };
}

export async function unfollowCarmunityUser(input: {
  followerId: string;
  followingId: string;
}): Promise<CarmunityServiceSuccess | CarmunityServiceError> {
  await prisma.follow.deleteMany({
    where: {
      followerId: input.followerId,
      followingId: input.followingId,
    },
  });
  return { ok: true };
}
