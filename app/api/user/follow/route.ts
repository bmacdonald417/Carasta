import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { followCarmunityUser, unfollowCarmunityUser } from "@/lib/carmunity/engagement-service";
import { prisma } from "@/lib/db";
import { notifyUserFollowed } from "@/lib/notifications/carmunity-retention-notifications";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  const followerId = (session?.user as { id?: string } | undefined)?.id;
  if (!followerId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const followingId = parsed.data.userId;

  const alreadyFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
    select: { id: true },
  });

  const result = await followCarmunityUser({ followerId, followingId });
  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  if (!alreadyFollowing) {
    const actor = await prisma.user.findUnique({
      where: { id: followerId },
      select: { handle: true, name: true },
    });
    if (actor) {
      await notifyUserFollowed({
        prisma,
        recipientId: followingId,
        actorId: followerId,
        actorHandle: actor.handle,
        actorName: actor.name,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  const followerId = (session?.user as { id?: string } | undefined)?.id;
  if (!followerId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const result = await unfollowCarmunityUser({
    followerId,
    followingId: parsed.data.userId,
  });
  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
