import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { allowAction } from "@/lib/api-rate-limit";
import { getSession } from "@/lib/auth";
import { createForumReply, listForumRepliesPage } from "@/lib/forums/forum-service";

const bodySchema = z.object({
  body: z.string().min(1).max(8000),
  parentReplyId: z.string().min(1).optional().nullable(),
});

/**
 * GET — paginated replies (oldest first). Public read.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  if (!threadId) {
    return NextResponse.json({ message: "Thread id required." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const take = z.coerce.number().min(1).max(80).safeParse(searchParams.get("take") ?? "40");
  const cursorId = searchParams.get("cursor")?.trim() || null;

  const session = await getSession();
  const viewerUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const viewerIsAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const page = await listForumRepliesPage({
    threadId,
    take: take.success ? take.data : 40,
    cursorId,
    viewerUserId,
    viewerIsAdmin,
  });

  return NextResponse.json(page);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  if (!allowAction(`discussion-reply:${userId}`, 700)) {
    return NextResponse.json({ message: "Slow down — try again in a moment." }, { status: 429 });
  }

  const { threadId } = await params;
  if (!threadId) {
    return NextResponse.json({ message: "Thread id required." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid body." }, { status: 400 });
  }

  const result = await createForumReply({
    threadId,
    authorId: userId,
    body: parsed.data.body,
    parentReplyId: parsed.data.parentReplyId ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, replyId: result.replyId, replyCount: result.replyCount });
}
