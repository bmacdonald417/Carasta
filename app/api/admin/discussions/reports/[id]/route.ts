import { DiscussionReportStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    status: z.nativeEnum(DiscussionReportStatus).optional(),
    moderatorNote: z.string().max(4000).optional().nullable(),
  })
  .refine((v) => v.status !== undefined || v.moderatorNote !== undefined, {
    message: "Provide status and/or moderatorNote.",
  });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Report id required." }, { status: 400 });
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

  const existing = await prisma.discussionReport.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Report not found." }, { status: 404 });
  }

  const now = new Date();
  const data: {
    status?: DiscussionReportStatus;
    moderatorNote?: string | null;
    reviewedAt?: Date;
    reviewedById?: string;
  } = {};

  if (parsed.data.status !== undefined) {
    data.status = parsed.data.status;
  }
  if (parsed.data.moderatorNote !== undefined) {
    data.moderatorNote = parsed.data.moderatorNote;
  }
  data.reviewedAt = now;
  data.reviewedById = admin.userId;

  const updated = await prisma.discussionReport.update({
    where: { id },
    data,
    select: {
      id: true,
      status: true,
      moderatorNote: true,
      reviewedAt: true,
      reviewedById: true,
    },
  });

  return NextResponse.json({ ok: true, report: updated });
}
