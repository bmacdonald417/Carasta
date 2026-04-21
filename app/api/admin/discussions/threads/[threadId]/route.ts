import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { isReviewModeEnabled } from "@/lib/review-mode";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  isHidden: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  if (isReviewModeEnabled()) {
    return NextResponse.json(
      { message: "Review mode is read-only for moderation actions." },
      { status: 403 }
    );
  }
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

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

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { id: true },
  });
  if (!thread) {
    return NextResponse.json({ message: "Thread not found." }, { status: 404 });
  }

  const isHidden = parsed.data.isHidden;
  const updated = await prisma.forumThread.update({
    where: { id: threadId },
    data: {
      isHidden,
      hiddenAt: isHidden ? new Date() : null,
      hiddenById: isHidden ? admin.userId : null,
    },
    select: { id: true, isHidden: true, hiddenAt: true, hiddenById: true },
  });

  return NextResponse.json({ ok: true, thread: updated });
}
