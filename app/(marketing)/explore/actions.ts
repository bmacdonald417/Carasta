"use server";

import { getSession } from "@/lib/auth";
import {
  addCarmunityComment,
  createCarmunityPost,
  likeCarmunityPost,
  unlikeCarmunityPost,
} from "@/lib/carmunity/engagement-service";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const content = formData.get("content") as string | null;
  const imageUrl = formData.get("imageUrl") as string | null;
  const result = await createCarmunityPost({
    authorId: (session.user as any).id,
    content,
    imageUrl,
  });
  if (!result.ok) return result;
  revalidatePath("/explore");
  return { ok: true };
}

export async function likePost(postId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const result = await likeCarmunityPost({
    userId: (session.user as any).id,
    postId,
  });
  if (!result.ok) return result;
  revalidatePath("/explore");
  return { ok: true };
}

export async function unlikePost(postId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const result = await unlikeCarmunityPost({
    userId: (session.user as any).id,
    postId,
  });
  if (!result.ok) return result;
  revalidatePath("/explore");
  return { ok: true };
}

export async function addComment(postId: string, content: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const result = await addCarmunityComment({
    authorId: (session.user as any).id,
    postId,
    content,
  });
  if (!result.ok) return result;
  revalidatePath("/explore");
  revalidatePath(`/explore/post/${postId}`);
  return { ok: true };
}
