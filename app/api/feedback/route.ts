import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  FeedbackAuthError,
  requireFeedbackActor,
  requireRole,
} from "@/lib/feedback-auth";
import { getFeedbackOrganizationId } from "@/lib/feedback-org";

const postSchema = z.object({
  content: z.string().min(1).max(8000),
  category: z.enum(["bug", "ux", "feature", "general"]),
  pageUrl: z.string().max(2000).optional(),
  elementSelector: z.string().max(4000).optional(),
  elementText: z.string().max(8000).optional(),
  elementType: z.string().max(256).optional(),
  elementIdAttr: z.string().max(512).optional(),
  elementClassAttr: z.string().max(2000).optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "reviewed", "resolved"]),
  resolutionCommitSha: z.string().max(128).nullable().optional(),
  resolutionCommitUrl: z.string().max(2000).nullable().optional(),
  resolutionSummary: z.string().max(8000).nullable().optional(),
  resolutionFiles: z.unknown().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, organizationId } = await requireFeedbackActor();
    const json = await req.json();
    const body = postSchema.parse(json);

    const row = await prisma.elementFeedback.create({
      data: {
        organizationId,
        userId,
        content: body.content,
        category: body.category,
        pageUrl: body.pageUrl ?? null,
        elementSelector: body.elementSelector ?? null,
        elementText: body.elementText ?? null,
        elementType: body.elementType ?? null,
        elementIdAttr: body.elementIdAttr ?? null,
        elementClassAttr: body.elementClassAttr ?? null,
        status: "pending",
      },
    });

    return NextResponse.json({ id: row.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: e.flatten() },
        { status: 400 }
      );
    }
    if (e instanceof FeedbackAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(["Admin", "Compliance"]);
    const json = await req.json();
    const body = patchSchema.parse(json);

    const updated = await prisma.elementFeedback.updateMany({
      where: { id: body.id, organizationId: getFeedbackOrganizationId() },
      data: {
        status: body.status,
        resolutionCommitSha: body.resolutionCommitSha ?? undefined,
        resolutionCommitUrl: body.resolutionCommitUrl ?? undefined,
        resolutionSummary: body.resolutionSummary ?? undefined,
        resolutionFiles:
          body.resolutionFiles === undefined
            ? undefined
            : body.resolutionFiles === null
              ? Prisma.JsonNull
              : (body.resolutionFiles as Prisma.InputJsonValue),
        resolvedAt: body.status === "resolved" ? new Date() : null,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: e.flatten() },
        { status: 400 }
      );
    }
    if (e instanceof FeedbackAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
