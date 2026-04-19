import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  const blockerId = (session?.user as { id?: string } | undefined)?.id;
  if (!blockerId) {
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

  const blockedId = parsed.data.userId;
  if (blockedId === blockerId) {
    return NextResponse.json({ message: "You can’t block yourself." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  await prisma.userBlock.upsert({
    where: {
      blockerId_blockedId: { blockerId, blockedId },
    },
    create: { blockerId, blockedId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  const blockerId = (session?.user as { id?: string } | undefined)?.id;
  if (!blockerId) {
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

  await prisma.userBlock.deleteMany({
    where: { blockerId, blockedId: parsed.data.userId },
  });

  return NextResponse.json({ ok: true });
}
