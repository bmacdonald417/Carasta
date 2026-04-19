import { DiscussionReactionKind } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

import { allowAction } from "@/lib/api-rate-limit";
import { removeDiscussionReaction, upsertDiscussionReaction } from "@/lib/forums/discussion-reactions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  target: z.enum(["thread", "reply"]),
  targetId: z.string().min(1),
  kind: z.nativeEnum(DiscussionReactionKind),
});

const deleteSchema = z.object({
  target: z.enum(["thread", "reply"]),
  targetId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!allowAction(`discussion-react:${userId}`, 450)) {
    return NextResponse.json({ message: "Slow down — try again in a moment." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const result = await upsertDiscussionReaction({
    prisma,
    userId,
    target: parsed.data.target,
    targetId: parsed.data.targetId,
    kind: parsed.data.kind,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, kind: result.kind });
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!allowAction(`discussion-react-del:${userId}`, 450)) {
    return NextResponse.json({ message: "Slow down — try again in a moment." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const result = await removeDiscussionReaction({
    prisma,
    userId,
    target: parsed.data.target,
    targetId: parsed.data.targetId,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
