"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const content = formData.get("content") as string | null;
  const imageUrl = formData.get("imageUrl") as string | null;
  if (!content?.trim() && !imageUrl?.trim()) {
    return { ok: false, error: "Add some text or a photo." };
  }

  await prisma.post.create({
    data: {
      authorId: (session.user as any).id,
      content: content?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
    },
  });
  revalidatePath("/explore");
  return { ok: true };
}

export async function likePost(postId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  await prisma.like.upsert({
    where: {
      userId_postId: { userId: (session.user as any).id, postId },
    },
    create: { userId: (session.user as any).id, postId },
    update: {},
  });
  revalidatePath("/explore");
  return { ok: true };
}

export async function unlikePost(postId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  await prisma.like.deleteMany({
    where: {
      userId: (session.user as any).id,
      postId,
    },
  });
  revalidatePath("/explore");
  return { ok: true };
}

export async function addComment(postId: string, content: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  if (!content?.trim()) return { ok: false, error: "Comment is required." };

  await prisma.comment.create({
    data: {
      postId,
      authorId: (session.user as any).id,
      content: content.trim(),
    },
  });
  revalidatePath("/explore");
  revalidatePath(`/explore/post/${postId}`);
  return { ok: true };
}
