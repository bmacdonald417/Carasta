import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { FeedbackAuthError, requireRole } from "@/lib/feedback-auth";
import { getFeedbackOrganizationId } from "@/lib/feedback-org";
import { fireClaudeCodeRoutine } from "@/lib/claude-code-routine-fire";

/**
 * Creates an agent run, then POSTs to Anthropic Claude Code “routine fire” when
 * CLAUDE_CODE_ROUTINE_TOKEN + (CLAUDE_CODE_ROUTINE_FIRE_URL | CLAUDE_CODE_ROUTINE_ID) are set.
 * @see https://platform.claude.com/docs/en/api/claude-code/routines-fire
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
    const fireUrlConfigured = Boolean(
      process.env.CLAUDE_CODE_ROUTINE_FIRE_URL?.trim() || routineId
    );
    const canFire = Boolean(routineToken && fireUrlConfigured);

    await prisma.agentRunEvent.create({
      data: {
        runId: run.id,
        kind: "queued",
        payload: {
          message: canFire
            ? "Calling Anthropic routine fire endpoint…"
            : !fireUrlConfigured
              ? "No routine URL or id configured; set CLAUDE_CODE_ROUTINE_FIRE_URL or CLAUDE_CODE_ROUTINE_ID."
              : "No CLAUDE_CODE_ROUTINE_TOKEN; generate an API trigger token in claude.ai/code/routines.",
          routineConfigured: canFire,
        },
      },
    });

    const site =
      process.env.NEXTAUTH_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "";
    const feedbackPath = "/dashboard/feedback";
    const text = [
      `Carasta: incorporate-feedback agent run`,
      `agentRunId=${run.id}`,
      `organizationId=${organizationId}`,
      site ? `site=${site.replace(/\/$/, "")}` : "",
      site
        ? `Admin feedback UI: ${site.replace(/\/$/, "")}${feedbackPath}`
        : `Admin path: ${feedbackPath}`,
    ]
      .filter(Boolean)
      .join("\n");

    const fire = await fireClaudeCodeRoutine({ text });

    if (fire.status === "ok") {
      const data = fire.data as {
        claude_code_session_id?: string;
        claude_code_session_url?: string;
      };
      const payload = JSON.parse(
        JSON.stringify({
          response: fire.data,
          sessionId: data?.claude_code_session_id ?? null,
          sessionUrl: data?.claude_code_session_url ?? null,
        })
      ) as Prisma.InputJsonValue;
      await prisma.agentRunEvent.create({
        data: {
          runId: run.id,
          kind: "anthropic_routine_fire",
          payload,
        },
      });
    } else if (fire.status === "skipped") {
      await prisma.agentRunEvent.create({
        data: {
          runId: run.id,
          kind: "anthropic_routine_skipped",
          payload: { reason: fire.reason },
        },
      });
    } else {
      await prisma.agentRunEvent.create({
        data: {
          runId: run.id,
          kind: "anthropic_routine_error",
          payload: {
            httpStatus: fire.httpStatus,
            message: fire.message,
          },
        },
      });
    }

    return NextResponse.json({ runId: run.id });
  } catch (e) {
    if (e instanceof FeedbackAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
