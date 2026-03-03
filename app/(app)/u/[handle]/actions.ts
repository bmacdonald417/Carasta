"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function followUser(targetUserId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const myId = (session.user as any).id;
  if (myId === targetUserId) return { ok: false, error: "Cannot follow yourself." };

  await prisma.follow.upsert({
    where: {
      followerId_followingId: { followerId: myId, followingId: targetUserId },
    },
    create: { followerId: myId, followingId: targetUserId },
    update: {},
  });

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

  await prisma.follow.deleteMany({
    where: {
      followerId: (session.user as any).id,
      followingId: targetUserId,
    },
  });

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { handle: true },
  });
  if (target) revalidatePath(`/u/${target.handle}`);
  return { ok: true };
}
