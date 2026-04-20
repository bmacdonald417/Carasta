import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateAgentShimRequest } from "@/lib/agent-shim-auth";
import { z } from "zod";

async function gateReadRun(
  req: NextRequest,
  runId: string
): Promise<NextResponse | null> {
  if (validateAgentShimRequest(req)) return null;

  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const run = await prisma.agentRun.findUnique({
    where: { id: runId },
    select: { id: true },
  });
  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;
  const gate = await gateReadRun(req, runId);
  if (gate) return gate;

  const events = await prisma.agentRunEvent.findMany({
    where: { runId },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      kind: e.kind,
      payload: e.payload,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

const postBody = z.object({
  kind: z.string().min(1).max(128),
  payload: z.unknown().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  if (!validateAgentShimRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const runId = params.runId;
  const run = await prisma.agentRun.findUnique({ where: { id: runId } });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const body = postBody.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const ev = await prisma.agentRunEvent.create({
    data: {
      runId,
      kind: body.data.kind,
      payload:
        body.data.payload === undefined
          ? undefined
          : body.data.payload === null
            ? Prisma.JsonNull
            : (body.data.payload as Prisma.InputJsonValue),
    },
  });

  return NextResponse.json({
    id: ev.id,
    kind: ev.kind,
    createdAt: ev.createdAt.toISOString(),
  });
}
