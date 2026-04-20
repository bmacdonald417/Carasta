import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { validateAgentShimRequest } from "@/lib/agent-shim-auth";
import { getFeedbackOrganizationId } from "@/lib/feedback-org";

/**
 * Agent-only feedback endpoints authenticated via x-agent-shim-secret.
 * GET  — list pending/reviewed items for the org (up to 200)
 * PATCH — resolve one or many items with commit metadata
 */

const resolveSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  resolutionCommitSha: z.string().max(128).optional(),
  resolutionCommitUrl: z.string().max(2000).optional(),
  resolutionSummary: z.string().max(8000).optional(),
  resolutionFiles: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  if (!validateAgentShimRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = getFeedbackOrganizationId();
  const rows = await prisma.elementFeedback.findMany({
    where: {
      organizationId,
      status: { in: ["pending", "reviewed"] },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      content: true,
      category: true,
      pageUrl: true,
      elementSelector: true,
      elementText: true,
      elementType: true,
      elementIdAttr: true,
      elementClassAttr: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    organizationId,
    count: rows.length,
    items: rows.map((r: typeof rows[number]) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!validateAgentShimRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = getFeedbackOrganizationId();
  const json = await req.json().catch(() => null);
  const body = resolveSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: body.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, resolutionCommitSha, resolutionCommitUrl, resolutionSummary, resolutionFiles } =
    body.data;

  const updated = await prisma.elementFeedback.updateMany({
    where: { id: { in: ids }, organizationId },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
      resolutionCommitSha: resolutionCommitSha ?? null,
      resolutionCommitUrl: resolutionCommitUrl ?? null,
      resolutionSummary: resolutionSummary ?? null,
      resolutionFiles:
        resolutionFiles === undefined
          ? undefined
          : resolutionFiles === null
            ? Prisma.JsonNull
            : (resolutionFiles as Prisma.InputJsonValue),
    },
  });

  return NextResponse.json({ ok: true, resolved: updated.count });
}
