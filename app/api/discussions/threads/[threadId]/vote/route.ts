import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  direction: z.enum(["up", "down", "none"]),
});

/**
 * POST /api/discussions/threads/[threadId]/vote
 * Upserts an upvote (LIKE) / downvote (DISLIKE) or removes it.
 * Uses ForumThreadReaction which allows one reaction kind per user per thread.
 */
export async function POST(
  req: NextRequest,
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
  // Map vote direction to reaction kind
  const kindMap = { up: "LIKE", down: "DISLIKE" } as const;

  try {
    if (direction === "none") {
      await prisma.forumThreadReaction.deleteMany({
        where: { threadId, userId },
      });
    } else {
      await prisma.forumThreadReaction.upsert({
        where: { threadId_userId: { threadId, userId } },
        create: { threadId, userId, kind: kindMap[direction] },
        update: { kind: kindMap[direction] },
      });
    }

    const [upCount, downCount, viewerReaction] = await Promise.all([
      prisma.forumThreadReaction.count({ where: { threadId, kind: "LIKE" } }),
      prisma.forumThreadReaction.count({ where: { threadId, kind: "DISLIKE" } }),
      prisma.forumThreadReaction.findUnique({
        where: { threadId_userId: { threadId, userId } },
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
    console.error("Vote error:", err);
    return NextResponse.json({ message: "Vote failed." }, { status: 500 });
  }
}
