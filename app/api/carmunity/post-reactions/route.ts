import { DiscussionReactionKind } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { allowAction } from "@/lib/api-rate-limit";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { removePostReaction, upsertPostReaction } from "@/lib/carmunity/post-reactions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const postSchema = z.object({
  postId: z.string().min(1),
  kind: z.nativeEnum(DiscussionReactionKind),
});

const deleteSchema = z.object({
  postId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!allowAction(`carmunity-post-react:${userId}`, 450)) {
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

  const result = await upsertPostReaction({
    prisma,
    userId,
    postId: parsed.data.postId,
    kind: parsed.data.kind,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, kind: parsed.data.kind });
}

export async function DELETE(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!allowAction(`carmunity-post-react-del:${userId}`, 450)) {
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

  const result = await removePostReaction({
    prisma,
    userId,
    postId: parsed.data.postId,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
