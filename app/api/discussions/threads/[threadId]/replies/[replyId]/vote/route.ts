import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  direction: z.enum(["up", "down", "none"]),
});

/**
 * POST /api/discussions/threads/[threadId]/replies/[replyId]/vote
 * Upserts an upvote (LIKE) / downvote (DISLIKE) on a reply, or removes it.
 * Uses ForumReplyReaction which allows one reaction kind per user per reply.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string; replyId: string }> }
) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { replyId } = await params;
  if (!replyId) {
    return NextResponse.json({ message: "Reply id required." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid direction." }, { status: 400 });
  }

  const { direction } = parsed.data;
  const kindMap = { up: "LIKE", down: "DISLIKE" } as const;

  try {
    if (direction === "none") {
      await prisma.forumReplyReaction.deleteMany({
        where: { replyId, userId },
      });
    } else {
      await prisma.forumReplyReaction.upsert({
        where: { replyId_userId: { replyId, userId } },
        create: { replyId, userId, kind: kindMap[direction] },
        update: { kind: kindMap[direction] },
      });
    }

    const [upCount, downCount, viewerReaction] = await Promise.all([
      prisma.forumReplyReaction.count({ where: { replyId, kind: "LIKE" } }),
      prisma.forumReplyReaction.count({ where: { replyId, kind: "DISLIKE" } }),
      prisma.forumReplyReaction.findUnique({
        where: { replyId_userId: { replyId, userId } },
        select: { kind: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      upCount,
      downCount,
      direction,
      viewerKind: viewerReaction?.kind ?? null,
    });
  } catch (err) {
    console.error("Reply vote error:", err);
    return NextResponse.json({ message: "Vote failed." }, { status: 500 });
  }
}
