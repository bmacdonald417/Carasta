import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  isHidden: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

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

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const reply = await prisma.forumReply.findUnique({
    where: { id: replyId },
    select: { id: true },
  });
  if (!reply) {
    return NextResponse.json({ message: "Reply not found." }, { status: 404 });
  }

  const isHidden = parsed.data.isHidden;
  const updated = await prisma.forumReply.update({
    where: { id: replyId },
    data: {
      isHidden,
      hiddenAt: isHidden ? new Date() : null,
      hiddenById: isHidden ? admin.userId : null,
    },
    select: { id: true, isHidden: true, hiddenAt: true, hiddenById: true },
  });

  return NextResponse.json({ ok: true, reply: updated });
}
