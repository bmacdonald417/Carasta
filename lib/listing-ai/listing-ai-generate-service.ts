import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import {
  listingAiStructuredResultSchema,
  type ListingAiGenerateBody,
  type ListingAiStructuredResult,
  type ListingAiWizardScope,
} from "@/lib/validations/listing-ai";

const SYSTEM_FULL = `You are an expert automotive listing editor for Carasta, a collector and enthusiast marketplace.
Return a single JSON object only (no markdown) with keys:
- "title": compelling auction title, max 200 chars, factual.
- "description": 2–6 short paragraphs: condition, notable options, service history if implied by input, why it matters to buyers. No false claims; if unknown, say so briefly. Plain text, no HTML.
- "conditionSummary": optional 1–3 sentences summarizing condition for a condition field; use empty string if nothing to add.

Rules:
- Never invent VIN decode, accident history, or legal guarantees.
- Match year/make/model/trim from input; do not change year.
- Tone: confident, specific, enthusiast-friendly; avoid ALL CAPS shouting.
- If intake includes seller "highlights", weave them naturally; do not contradict other fields.`;

const SYSTEM_CONDITION = `You are an expert automotive listing editor for Carasta.
The seller is on the CONDITION step. Return a single JSON object only (no markdown) with keys "title", "description", "conditionSummary" as required by the schema.

Focus:
- Primary: write an excellent "conditionSummary" (1–3 sentences) that matches any condition grade provided and the vehicle context. Honest, specific, no invented history.
- Secondary: lightly polish "title" and "description" ONLY if the seller left them empty; otherwise keep title and description semantically the same as the provided current text (minor wording tweaks allowed only if clearly better).

Rules:
- Never invent VIN decode, accident history, or legal guarantees.
- Do not change model year.`;

const SYSTEM_IMPERFECTIONS = `You are an expert automotive listing editor for Carasta.
The seller listed disclosed imperfections (locations, severities, notes). Return a single JSON object only (no markdown) with keys "title", "description", "conditionSummary".

Focus:
- Primary: rewrite or expand "description" to include a clear, buyer-friendly "Disclosures" tone: weave the imperfection list honestly into the narrative (plain text, no HTML). Do not minimize major items; do not shame the seller.
- Keep "title" essentially the same as the provided title (only fix obvious typos if any).
- Keep "conditionSummary" aligned with the provided current condition summary when present; you may tighten wording but do not contradict it.

Rules:
- Never invent damage not present in the imperfection list or highlights.
- Never invent VIN decode, accident history, or legal guarantees.
- Do not change model year.`;

function scopeFromIntake(intake: ListingAiGenerateBody): ListingAiWizardScope {
  return intake.wizardScope ?? "full";
}

function buildUserPromptFull(input: ListingAiGenerateBody): string {
  const lines: string[] = [
    `Vehicle: ${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ""}`,
  ];
  if (input.mileage != null) lines.push(`Mileage: ${input.mileage}`);
  if (input.vin) lines.push(`VIN (do not decode; treat as opaque): ${input.vin}`);
  if (input.title?.trim()) lines.push(`Current title (may improve): ${input.title.trim()}`);
  if (input.description?.trim()) lines.push(`Current description (may rewrite): ${input.description.trim()}`);
  if (input.conditionSummary?.trim()) {
    lines.push(`Current condition summary: ${input.conditionSummary.trim()}`);
  }
  if (input.conditionGrade) lines.push(`Condition grade (enum): ${input.conditionGrade}`);
  if (input.highlights?.trim()) lines.push(`Seller highlights / bullets:\n${input.highlights.trim()}`);
  if (input.tone?.trim()) lines.push(`Preferred tone: ${input.tone.trim()}`);
  if (input.audience?.trim()) lines.push(`Target audience: ${input.audience.trim()}`);
  lines.push(
    "",
    `Respond with JSON exactly shaped as:
{"title":"...","description":"...","conditionSummary":"..."}
Use "conditionSummary" as empty string if not needed.`
  );
  return lines.join("\n");
}

function buildUserPromptCondition(input: ListingAiGenerateBody): string {
  const lines: string[] = [
    `Vehicle: ${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ""}`,
  ];
  if (input.mileage != null) lines.push(`Mileage: ${input.mileage}`);
  if (input.vin) lines.push(`VIN (do not decode; treat as opaque): ${input.vin}`);
  if (input.conditionGrade) lines.push(`Selected condition grade: ${input.conditionGrade}`);
  if (input.title?.trim()) lines.push(`Current title (keep if already good): ${input.title.trim()}`);
  if (input.description?.trim()) {
    lines.push(`Current description (keep if already good): ${input.description.trim()}`);
  }
  if (input.conditionSummary?.trim()) {
    lines.push(`Current condition summary (may improve): ${input.conditionSummary.trim()}`);
  }
  if (input.highlights?.trim()) lines.push(`Extra seller notes:\n${input.highlights.trim()}`);
  if (input.tone?.trim()) lines.push(`Preferred tone: ${input.tone.trim()}`);
  lines.push(
    "",
    `Respond with JSON exactly shaped as:
{"title":"...","description":"...","conditionSummary":"..."}`
  );
  return lines.join("\n");
}

function buildUserPromptImperfections(input: ListingAiGenerateBody): string {
  const lines: string[] = [
    `Vehicle: ${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ""}`,
  ];
  if (input.title?.trim()) lines.push(`Current title: ${input.title.trim()}`);
  if (input.description?.trim()) lines.push(`Current description:\n${input.description.trim()}`);
  if (input.conditionSummary?.trim()) {
    lines.push(`Current condition summary (preserve meaning):\n${input.conditionSummary.trim()}`);
  }
  lines.push("");
  lines.push("Disclosed imperfections (authoritative):");
  lines.push(input.highlights?.trim() || "(none provided — ask seller to add rows or notes.)");
  if (input.tone?.trim()) lines.push(`Preferred tone: ${input.tone.trim()}`);
  lines.push(
    "",
    `Respond with JSON exactly shaped as:
{"title":"...","description":"...","conditionSummary":"..."}`
  );
  return lines.join("\n");
}

function mergeByScope(
  intake: ListingAiGenerateBody,
  out: ListingAiStructuredResult,
  scope: ListingAiWizardScope
): ListingAiStructuredResult {
  if (scope === "full") {
    const cs = out.conditionSummary?.trim();
    if (!cs) return { title: out.title, description: out.description };
    return { title: out.title, description: out.description, conditionSummary: cs };
  }

  if (scope === "condition") {
    const title = intake.title?.trim() || out.title;
    const description = intake.description?.trim() || out.description;
    const cs = out.conditionSummary?.trim() ?? "";
    return { title, description, ...(cs ? { conditionSummary: cs } : {}) };
  }

  // imperfections
  const title = intake.title?.trim() || out.title;
  const cs =
    intake.conditionSummary?.trim() ||
    out.conditionSummary?.trim() ||
    "";
  return {
    title,
    description: out.description,
    ...(cs ? { conditionSummary: cs } : {}),
  };
}

export async function generateListingAiCopy(
  intake: ListingAiGenerateBody
): Promise<ListingAiStructuredResult> {
  const scope = scopeFromIntake(intake);
  const system =
    scope === "condition" ? SYSTEM_CONDITION : scope === "imperfections" ? SYSTEM_IMPERFECTIONS : SYSTEM_FULL;
  const user =
    scope === "condition"
      ? buildUserPromptCondition(intake)
      : scope === "imperfections"
        ? buildUserPromptImperfections(intake)
        : buildUserPromptFull(intake);

  const raw = await openAiChatJsonObject({ system, user });
  const parsed = listingAiStructuredResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Model returned listing fields that failed validation.");
  }
  return mergeByScope(intake, parsed.data, scope);
}
