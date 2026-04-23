import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { allowAction } from "@/lib/api-rate-limit";
import { usersAreBlockedEitherWay, recipientHasMutedActor } from "@/lib/user-safety";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const sendMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});

function stripControlChars(s: string): string {
  // Remove nulls + other non-printable control chars, keep tabs/newlines.
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function buildPreview(body: string): string {
  const oneLine = body.replace(/\s+/g, " ").trim();
  return oneLine.length <= 240 ? oneLine : `${oneLine.slice(0, 239)}…`;
}

/**
 * POST /api/messages/conversations/[id]/messages
 * Sends a message (membership required, block-enforced, basic rate limited).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const senderId = await getJwtSubjectUserId(req);
  if (!senderId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "Conversation id required." }, { status: 400 });
  }

  // Guardrail: minimum interval between sends per user per conversation.
  if (!allowAction(`msg:${senderId}:${conversationId}`, 1200)) {
    return NextResponse.json({ ok: false, error: "You're sending messages too fast. Please wait a moment." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const body = stripControlChars(parsed.data.body).trim();
  if (!body) {
    return NextResponse.json({ ok: false, error: "Message cannot be empty." }, { status: 400 });
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  const participantIds = participants.map((p) => p.userId);
  if (!participantIds.includes(senderId)) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  // Phase Q supports only direct 1:1 in product surface.
  const recipientId = participantIds.find((id) => id !== senderId);
  if (!recipientId) {
    return NextResponse.json({ ok: false, error: "Invalid conversation." }, { status: 409 });
  }

  const blocked = await usersAreBlockedEitherWay(prisma, senderId, recipientId);
  if (blocked) {
    return NextResponse.json({ ok: false, error: "You cannot message this user." }, { status: 403 });
  }

  const now = new Date();
  const preview = buildPreview(body);

  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: { conversationId, senderId, body },
      select: { id: true, conversationId: true, senderId: true, body: true, createdAt: true },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: now, lastMessagePreview: preview },
      select: { id: true },
    });

    // Sender has obviously read up to now.
    await tx.conversationParticipant.updateMany({
      where: { conversationId, userId: senderId },
      data: { lastReadAt: now },
    });

    const muted = await recipientHasMutedActor(tx as any, recipientId, senderId);
    if (!muted) {
      await tx.notification.create({
        data: {
          userId: recipientId,
          actorId: senderId,
          targetId: conversationId,
          type: "MESSAGE",
          payloadJson: JSON.stringify({
            conversationId,
            href: `/messages/${conversationId}`,
            message: preview,
            title: preview,
            preview,
          }),
        },
        select: { id: true },
      });
    }

    return { message };
  });

  return NextResponse.json({ ok: true, message: result.message });
}

