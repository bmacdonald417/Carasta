import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { usersAreBlockedEitherWay } from "@/lib/user-safety";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createConversationSchema = z.object({
  targetUserId: z.string().min(1),
  auctionId: z.string().min(1).optional(),
});

function directKeyFor(userA: string, userB: string, auctionId?: string): string {
  const pair = userA < userB ? `${userA}:${userB}` : `${userB}:${userA}`;
  return auctionId ? `${pair}:a:${auctionId}` : `${pair}:g`;
}

/**
 * GET /api/messages/conversations
 * List current user's conversations with other participant(s), preview, and unread count.
 */
export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: {
      conversationId: true,
      lastReadAt: true,
      conversation: {
        select: {
          id: true,
          updatedAt: true,
          lastMessageAt: true,
          lastMessagePreview: true,
          participants: {
            select: {
              user: {
                select: { id: true, handle: true, name: true, avatarUrl: true, image: true },
              },
            },
          },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
    take: 60,
  });

  const conversations = await Promise.all(
    rows.map(async (r) => {
      const conv = r.conversation;
      const others = conv.participants
        .map((p) => p.user)
        .filter((u) => u.id !== userId);

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          createdAt: r.lastReadAt ? { gt: r.lastReadAt } : undefined,
          senderId: { not: userId },
        },
      });

      return {
        id: conv.id,
        lastMessageAt: conv.lastMessageAt,
        lastMessagePreview: conv.lastMessagePreview,
        otherParticipants: others,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ ok: true, conversations });
}

/**
 * POST /api/messages/conversations
 * Create-or-get an existing 1:1 conversation for current user and targetUserId.
 */
export async function POST(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createConversationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const targetUserId = parsed.data.targetUserId;
  const auctionId = parsed.data.auctionId;
  if (targetUserId === userId) {
    return NextResponse.json({ ok: false, error: "Cannot message yourself." }, { status: 400 });
  }

  const blocked = await usersAreBlockedEitherWay(prisma, userId, targetUserId);
  if (blocked) {
    return NextResponse.json({ ok: false, error: "You cannot message this user." }, { status: 403 });
  }

  let auctionRow: { id: string; sellerId: string; title: string; status: string } | null = null;
  if (auctionId) {
    auctionRow = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { id: true, sellerId: true, title: true, status: true },
    });
    if (!auctionRow) {
      return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
    }
    if (auctionRow.sellerId === userId) {
      return NextResponse.json({ ok: false, error: "You cannot message yourself about your own listing." }, { status: 400 });
    }
    if (auctionRow.sellerId !== targetUserId) {
      return NextResponse.json({ ok: false, error: "Target user is not the seller for this listing." }, { status: 400 });
    }
  }

  const dk = directKeyFor(userId, targetUserId, auctionId);

  const convo = await prisma.conversation.upsert({
    where: { directKey: dk },
    create: {
      directKey: dk,
      auctionId: auctionId ?? null,
      participants: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    update: {},
    select: { id: true },
  });

  return NextResponse.json({ ok: true, conversationId: convo.id });
}

