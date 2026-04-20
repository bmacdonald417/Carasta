import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FeedbackAuthError, requireRole } from "@/lib/feedback-auth";
import { getFeedbackOrganizationId } from "@/lib/feedback-org";

/**
 * Starts an agent run record for "incorporate feedback" workflows.
 * Wire `CLAUDE_CODE_ROUTINE_ID` + `CLAUDE_CODE_ROUTINE_TOKEN` in your host to call an external routine;
 * this route always creates a durable run + seed event for polling UIs.
 */
export async function POST() {
  try {
    await requireRole(["Admin", "Compliance"]);
    const organizationId = getFeedbackOrganizationId();

    const run = await prisma.agentRun.create({
      data: {
        organizationId,
        type: "incorporate_feedback",
        status: "running",
      },
    });

    const routineId = process.env.CLAUDE_CODE_ROUTINE_ID?.trim();
    const routineToken = process.env.CLAUDE_CODE_ROUTINE_TOKEN?.trim();

    await prisma.agentRunEvent.create({
      data: {
        runId: run.id,
        kind: "queued",
        payload: {
          message: routineId
            ? "External routine id configured; hook your runner to call the agent shim endpoints."
            : "No CLAUDE_CODE_ROUTINE_ID set. Use scripts/run-feedback-agent.mjs locally or attach your runner.",
          routineConfigured: Boolean(routineId && routineToken),
        },
      },
    });

    return NextResponse.json({ runId: run.id });
  } catch (e) {
    if (e instanceof FeedbackAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
