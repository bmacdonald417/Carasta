import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateAgentShimRequest } from "@/lib/agent-shim-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;

  if (!validateAgentShimRequest(req)) {
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const run = await prisma.agentRun.findUnique({
    where: { id: runId },
    include: {
      _count: { select: { events: true } },
    },
  });

  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: run.id,
    organizationId: run.organizationId,
    type: run.type,
    status: run.status,
    createdAt: run.createdAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    eventCount: run._count.events,
  });
}
