import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { usersAreBlockedEitherWay } from "@/lib/user-safety";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { threadId } = await params;
  if (!threadId) {
    return NextResponse.json({ message: "Thread id required." }, { status: 400 });
  }

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { id: true, isHidden: true, authorId: true },
  });
  if (!thread) {
    return NextResponse.json({ message: "Thread not found." }, { status: 404 });
  }
  if (thread.isHidden) {
    return NextResponse.json({ message: "This thread is not available." }, { status: 400 });
  }
  if (await usersAreBlockedEitherWay(prisma, userId, thread.authorId)) {
    return NextResponse.json({ message: "You can’t save this thread." }, { status: 400 });
  }

  await prisma.forumThreadSubscription.upsert({
    where: {
      userId_threadId: { userId, threadId },
    },
    create: { userId, threadId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { threadId } = await params;
  if (!threadId) {
    return NextResponse.json({ message: "Thread id required." }, { status: 400 });
  }

  await prisma.forumThreadSubscription.deleteMany({
    where: { userId, threadId },
  });

  return NextResponse.json({ ok: true });
}
