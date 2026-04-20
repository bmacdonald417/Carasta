import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateAgentShimRequest } from "@/lib/agent-shim-auth";
import { z } from "zod";

const patchBody = z.object({
  status: z.enum(["running", "done", "error"]),
  completedAt: z.string().datetime().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  if (!validateAgentShimRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runId = params.runId;
  const json = await req.json().catch(() => null);
  const body = patchBody.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const completedAt =
    body.data.status === "running"
      ? null
      : body.data.completedAt
        ? new Date(body.data.completedAt)
        : new Date();

  const updated = await prisma.agentRun.updateMany({
    where: { id: runId },
    data: {
      status: body.data.status,
      completedAt,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
