import { DiscussionReportReason } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { createDiscussionReport } from "@/lib/forums/discussion-reports";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const reasonSchema = z.nativeEnum(DiscussionReportReason);

const bodySchema = z.discriminatedUnion("target", [
  z.object({
    target: z.literal("thread"),
    threadId: z.string().min(1),
    reason: reasonSchema,
    details: z.string().max(4000).optional().nullable(),
  }),
  z.object({
    target: z.literal("reply"),
    threadId: z.string().min(1),
    replyId: z.string().min(1),
    reason: reasonSchema,
    details: z.string().max(4000).optional().nullable(),
  }),
]);

export async function POST(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const payload = parsed.data;
  const result = await createDiscussionReport({
    prisma,
    reporterId: userId,
    target: payload.target,
    threadId: payload.threadId,
    replyId: payload.target === "reply" ? payload.replyId : null,
    reason: payload.reason,
    details: payload.details ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    reportId: result.reportId,
    deduped: result.deduped,
  });
}
