import type { Prisma } from "@prisma/client";

type ListingAiRunListItem = {
  id: string;
  createdAt: string;
  model: string;
  kind: "LISTING_GENERATE" | "FIELD_REWRITE" | "UNKNOWN";
  field: string | null;
  preview: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function pickRunKind(intake: unknown): ListingAiRunListItem["kind"] {
  const o = asRecord(intake);
  const k = o?._runKind;
  if (k === "FIELD_REWRITE") return "FIELD_REWRITE";
  if (k === "LISTING_GENERATE") return "LISTING_GENERATE";
  return "UNKNOWN";
}

function pickField(intake: unknown): string | null {
  const o = asRecord(intake);
  const f = o?.field;
  return typeof f === "string" ? f : null;
}

function buildPreview(output: unknown): string {
  const o = asRecord(output);
  if (!o) return "";
  if (typeof o.text === "string") return o.text.slice(0, 400);
  const title = typeof o.title === "string" ? o.title : "";
  const shortSummary =
    typeof o.shortSummary === "string" ? o.shortSummary.slice(0, 160) : "";
  const desc = typeof o.description === "string" ? o.description.slice(0, 240) : "";
  const cs =
    typeof o.conditionSummary === "string" ? o.conditionSummary.slice(0, 160) : "";
  const missingInfo = Array.isArray(o.missingInfo)
    ? (o.missingInfo as unknown[])
        .filter((v): v is string => typeof v === "string")
        .slice(0, 2)
        .join(" | ")
    : "";
  const parts = [title, shortSummary, desc, cs, missingInfo && `Missing: ${missingInfo}`].filter(Boolean);
  return parts.join("\n\n").slice(0, 500);
}

/** Strip sensitive / bulky intake; keep high-signal metadata only. */
function summarizeIntake(intake: unknown): string | null {
  const o = asRecord(intake);
  if (!o) return null;
  const kind = o._runKind;
  if (kind === "FIELD_REWRITE") {
    const field = typeof o.field === "string" ? o.field : "?";
    const instr =
      typeof o.instruction === "string" && o.instruction.trim()
        ? ` · ${o.instruction.trim().slice(0, 80)}`
        : "";
    return `field=${field}${instr}`;
  }
  if (kind === "LISTING_GENERATE") {
    const scope = typeof o.wizardScope === "string" ? o.wizardScope : "full";
    const audiencePreset =
      typeof o.audiencePreset === "string" ? ` · audience=${o.audiencePreset}` : "";
    const history =
      typeof o.serviceHistoryConfidence === "string"
        ? ` · history=${o.serviceHistoryConfidence}`
        : "";
    return `wizardScope=${scope}${audiencePreset}${history}`;
  }
  return null;
}

export function formatListingAiRunRow(row: {
  id: string;
  createdAt: Date;
  model: string;
  intakeJson: Prisma.JsonValue;
  outputJson: Prisma.JsonValue;
}): ListingAiRunListItem & { intakeSummary: string | null } {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    model: row.model,
    kind: pickRunKind(row.intakeJson),
    field: pickField(row.intakeJson),
    preview: buildPreview(row.outputJson),
    intakeSummary: summarizeIntake(row.intakeJson),
  };
}
