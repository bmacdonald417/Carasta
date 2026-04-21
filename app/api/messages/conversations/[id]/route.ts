import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/messages/conversations/[id]
 * Loads messages (simple pagination via ?cursor=<messageId>&limit=..). Requires membership.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId = await getJwtSubjectUserId(req);
  if (!userId && isReviewModeEnabled()) {
    userId = (await getReviewModeContext())?.sellerUserId;
  }
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "Conversation id required." }, { status: 400 });
  }

  const member = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true, lastReadAt: true },
  });
  if (!member) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const cursor = url.searchParams.get("cursor")?.trim() || undefined;
  const limit = Math.min(Math.max(Number.parseInt(limitRaw ?? "30", 10) || 30, 1), 80);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      senderId: true,
      body: true,
      createdAt: true,
      isEdited: true,
      isSystem: true,
      sender: { select: { id: true, handle: true, name: true, avatarUrl: true, image: true } },
    },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      auctionId: true,
      lastMessageAt: true,
      lastMessagePreview: true,
      participants: {
        select: { user: { select: { id: true, handle: true, name: true, avatarUrl: true, image: true } } },
      },
      auction: {
        select: {
          id: true,
          title: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          status: true,
          endAt: true,
          buyNowPriceCents: true,
          reservePriceCents: true,
          images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
          seller: { select: { id: true, handle: true, name: true, avatarUrl: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    conversation,
    messages,
    nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
  });
}

