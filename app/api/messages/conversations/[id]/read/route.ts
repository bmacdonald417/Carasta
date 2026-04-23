import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/messages/conversations/[id]/read
 * Updates the participant row's lastReadAt to now.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: "Conversation id required." }, { status: 400 });
  }

  const updated = await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });

  if (updated.count === 0) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

