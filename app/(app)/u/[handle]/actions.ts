"use server";

import { getSession } from "@/lib/auth";
import { followCarmunityUser, unfollowCarmunityUser } from "@/lib/carmunity/engagement-service";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function followUser(targetUserId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const myId = (session.user as any).id;

  const result = await followCarmunityUser({
    followerId: myId,
    followingId: targetUserId,
  });
  if (!result.ok) return result;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { handle: true },
  });
  if (target) revalidatePath(`/u/${target.handle}`);
  return { ok: true };
}

export async function unfollowUser(targetUserId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const result = await unfollowCarmunityUser({
    followerId: (session.user as any).id,
    followingId: targetUserId,
  });
  if (!result.ok) return result;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { handle: true },
  });
  if (target) revalidatePath(`/u/${target.handle}`);
  return { ok: true };
}
