import type { Prisma } from "@prisma/client";

export type MarketingCopilotRunKind = "GENERATE" | "REGEN_TASK" | "REGEN_ARTIFACT" | "UNKNOWN";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function pickKind(intake: unknown): MarketingCopilotRunKind {
  const o = asRecord(intake);
  const k = o?._runKind;
  if (k === "GENERATE") return "GENERATE";
  if (k === "REGEN_TASK") return "REGEN_TASK";
  if (k === "REGEN_ARTIFACT") return "REGEN_ARTIFACT";
  return "UNKNOWN";
}

function buildPreview(output: unknown, kind: MarketingCopilotRunKind): string {
  const o = asRecord(output);
  if (!o) return "";
  if (kind === "GENERATE") {
    const plan = asRecord(o.plan);
    const summary =
      typeof plan?.summaryStrategy === "string" ? plan.summaryStrategy.slice(0, 220) : "";
    const priorityActions = Array.isArray(o.priorityActions) ? o.priorityActions : [];
    const firstPriority = priorityActions[0] != null ? asRecord(priorityActions[0]) : null;
    const p1 =
      firstPriority && typeof firstPriority.title === "string"
        ? firstPriority.title
        : "";
    const tasks = Array.isArray(o.tasks) ? o.tasks : [];
    const first = tasks[0] != null ? asRecord(tasks[0]) : null;
    const t1 = first && typeof first.title === "string" ? first.title : "";
    return [summary, p1, t1].filter(Boolean).join("\n\n").slice(0, 500);
  }
  if (kind === "REGEN_TASK") {
    const t = asRecord(o.task);
    const title = typeof t?.title === "string" ? t.title : "";
    const desc = typeof t?.description === "string" ? t.description.slice(0, 240) : "";
    return `${title}${desc ? `\n${desc}` : ""}`.trim().slice(0, 400);
  }
  if (kind === "REGEN_ARTIFACT") {
    const a = asRecord(o.artifact);
    const typ = typeof a?.type === "string" ? a.type : "";
    const content = typeof a?.content === "string" ? a.content.slice(0, 400) : "";
    return `${typ}${content ? `\n${content}` : ""}`.trim();
  }
  return "";
}

/** Strip bulky intake; keep high-signal metadata only. */
function summarizeIntake(intake: unknown): string | null {
  const o = asRecord(intake);
  if (!o) return null;
  const k = o._runKind;
  if (k === "GENERATE") {
    const ch = Array.isArray(o.channels) ? (o.channels as string[]).join(", ") : "";
    const g = typeof o.objectiveGoal === "string" ? o.objectiveGoal.slice(0, 72) : "";
    const mode =
      typeof o.workflowMode === "string" ? `mode=${o.workflowMode}` : "";
    const parts = [`channels=${ch}`];
    if (mode) parts.push(mode);
    if (g) parts.push(`goal=${g}`);
    return parts.join(" · ");
  }
  if (k === "REGEN_TASK") {
    const inner = asRecord(o.task);
    const title = inner && typeof inner.title === "string" ? inner.title.slice(0, 80) : "?";
    return `task=${title}`;
  }
  if (k === "REGEN_ARTIFACT") {
    const inner = asRecord(o.artifact);
    const typ = inner && typeof inner.type === "string" ? inner.type : "?";
    const ch = inner && typeof inner.channel === "string" ? inner.channel : "";
    return ch ? `artifact=${typ} · ${ch}` : `artifact=${typ}`;
  }
  return null;
}

export function formatMarketingCopilotRunRow(row: {
  id: string;
  createdAt: Date;
  model: string;
  appliedAt: Date | null;
  intakeJson: Prisma.JsonValue;
  outputJson: Prisma.JsonValue;
}): {
  id: string;
  createdAt: string;
  model: string;
  kind: MarketingCopilotRunKind;
  applied: boolean;
  preview: string;
  intakeSummary: string | null;
} {
  const kind = pickKind(row.intakeJson);
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    model: row.model,
    kind,
    applied: row.appliedAt != null,
    preview: buildPreview(row.outputJson, kind),
    intakeSummary: summarizeIntake(row.intakeJson),
  };
}
