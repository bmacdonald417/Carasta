import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  mutedUserId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
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

  const mutedUserId = parsed.data.mutedUserId;
  if (mutedUserId === userId) {
    return NextResponse.json({ message: "You can’t mute yourself." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: mutedUserId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  await prisma.userMute.upsert({
    where: {
      userId_mutedUserId: { userId, mutedUserId },
    },
    create: { userId, mutedUserId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
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

  await prisma.userMute.deleteMany({
    where: { userId, mutedUserId: parsed.data.mutedUserId },
  });

  return NextResponse.json({ ok: true });
}
