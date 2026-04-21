import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import { deriveListingReadinessSnapshot } from "@/lib/listing-ai/listing-ai-readiness";
import {
  listingAiStructuredResultSchema,
  type ListingAiGenerateBody,
  type ListingAiStructuredResult,
  type ListingAiWizardScope,
} from "@/lib/validations/listing-ai";

const SYSTEM_FULL = `You are an expert automotive listing editor for Carasta, a collector and enthusiast marketplace.
Return a single JSON object only (no markdown) with keys:
- "title": compelling auction title, max 200 chars, factual.
- "titleOptions": 2-4 factual alternative title options.
- "shortSummary": 1-2 sentence top-line summary for a seller preview panel.
- "description": 2–6 short paragraphs: condition, notable options, service history if implied by input, why it matters to buyers. No false claims; if unknown, say so briefly. Plain text, no HTML.
- "conditionSummary": optional 1–3 sentences summarizing condition for a condition field; use empty string if nothing to add.
- "missingInfo": specific missing seller inputs that would improve confidence. Prefer explicit gaps over invented certainty.
- "riskFlags": factual-writing cautions or overclaim risks.
- "readinessScore": integer 0-100 based only on seller-provided context and clearly missing context.
- "readinessReasons": concise reasons for the score.
- "disclosureSuggestions": seller-safe disclosure or clarification suggestions.

Rules:
- Never invent VIN decode, accident history, or legal guarantees.
- Match year/make/model/trim from input; do not change year.
- Tone: confident, specific, enthusiast-friendly; avoid ALL CAPS shouting.
- If intake includes seller "highlights", weave them naturally; do not contradict other fields.
- Audience presets affect emphasis only, never the underlying facts.
- If a fact is not supported, call it unknown or list it in missingInfo rather than implying certainty.`;

const SYSTEM_CONDITION = `You are an expert automotive listing editor for Carasta.
The seller is on the CONDITION step. Return a single JSON object only (no markdown) with the schema keys required for listing AI output.

Focus:
- Primary: write an excellent "conditionSummary" (1–3 sentences) that matches any condition grade provided and the vehicle context. Honest, specific, no invented history.
- Secondary: lightly polish "title" and "description" ONLY if the seller left them empty; otherwise keep title and description semantically the same as the provided current text (minor wording tweaks allowed only if clearly better).

Rules:
- Never invent VIN decode, accident history, or legal guarantees.
- Do not change model year.
- Use missingInfo / riskFlags / disclosureSuggestions to surface gaps instead of guessing.`;

const SYSTEM_IMPERFECTIONS = `You are an expert automotive listing editor for Carasta.
The seller listed disclosed imperfections (locations, severities, notes). Return a single JSON object only (no markdown) with the schema keys required for listing AI output.

Focus:
- Primary: rewrite or expand "description" to include a clear, buyer-friendly "Disclosures" tone: weave the imperfection list honestly into the narrative (plain text, no HTML). Do not minimize major items; do not shame the seller.
- Keep "title" essentially the same as the provided title (only fix obvious typos if any).
- Keep "conditionSummary" aligned with the provided current condition summary when present; you may tighten wording but do not contradict it.

Rules:
- Never invent damage not present in the imperfection list or highlights.
- Never invent VIN decode, accident history, or legal guarantees.
- Do not change model year.
- Use disclosureSuggestions to tighten honesty and scanability, not to add unsupported facts.`;

function scopeFromIntake(intake: ListingAiGenerateBody): ListingAiWizardScope {
  return intake.wizardScope ?? "full";
}

function buildUserPromptFull(input: ListingAiGenerateBody): string {
  const readiness = deriveListingReadinessSnapshot(input);
  const lines: string[] = [
    "AUTHORITATIVE_LISTING_CONTEXT_JSON:",
    JSON.stringify({
      vehicle: {
        year: input.year,
        make: input.make,
        model: input.model,
        trim: input.trim ?? null,
        mileage: input.mileage ?? null,
        vin: input.vin ?? null,
        conditionGrade: input.conditionGrade ?? null,
      },
      currentFields: {
        title: input.title ?? "",
        description: input.description ?? "",
        conditionSummary: input.conditionSummary ?? "",
      },
      sellerContext: {
        highlights: input.highlights ?? "",
        tone: input.tone ?? "",
        audience: input.audience ?? "",
        audiencePreset: input.audiencePreset ?? null,
        ownershipDuration: input.ownershipDuration ?? "",
        serviceHistoryConfidence: input.serviceHistoryConfidence ?? "unknown",
        modifications: input.modifications ?? "",
        originality: input.originality ?? "",
        documentationAvailable: input.documentationAvailable ?? "",
        sellingReason: input.sellingReason ?? "",
      },
      readinessContext: readiness,
    }),
  ];
  lines.push(
    "",
    `Respond with JSON exactly shaped as:
{"title":"...","titleOptions":["..."],"shortSummary":"...","description":"...","conditionSummary":"...","missingInfo":["..."],"riskFlags":["..."],"readinessScore":0,"readinessReasons":["..."],"disclosureSuggestions":["..."]}
Use "conditionSummary" as empty string if not needed.`
  );
  return lines.join("\n");
}

function buildUserPromptCondition(input: ListingAiGenerateBody): string {
  const readiness = deriveListingReadinessSnapshot(input);
  const lines: string[] = [
    "AUTHORITATIVE_LISTING_CONTEXT_JSON:",
    JSON.stringify({
      vehicle: {
        year: input.year,
        make: input.make,
        model: input.model,
        trim: input.trim ?? null,
        mileage: input.mileage ?? null,
        vin: input.vin ?? null,
        conditionGrade: input.conditionGrade ?? null,
      },
      currentFields: {
        title: input.title ?? "",
        description: input.description ?? "",
        conditionSummary: input.conditionSummary ?? "",
      },
      sellerContext: {
        highlights: input.highlights ?? "",
        tone: input.tone ?? "",
        audiencePreset: input.audiencePreset ?? null,
        serviceHistoryConfidence: input.serviceHistoryConfidence ?? "unknown",
        documentationAvailable: input.documentationAvailable ?? "",
      },
      readinessContext: readiness,
    }),
  ];
  lines.push(
    "",
    `Respond with JSON exactly shaped as:
{"title":"...","titleOptions":["..."],"shortSummary":"...","description":"...","conditionSummary":"...","missingInfo":["..."],"riskFlags":["..."],"readinessScore":0,"readinessReasons":["..."],"disclosureSuggestions":["..."]}`
  );
  return lines.join("\n");
}

function buildUserPromptImperfections(input: ListingAiGenerateBody): string {
  const readiness = deriveListingReadinessSnapshot(input);
  const lines: string[] = [
    "AUTHORITATIVE_LISTING_CONTEXT_JSON:",
    JSON.stringify({
      vehicle: {
        year: input.year,
        make: input.make,
        model: input.model,
        trim: input.trim ?? null,
      },
      currentFields: {
        title: input.title ?? "",
        description: input.description ?? "",
        conditionSummary: input.conditionSummary ?? "",
      },
      disclosedImperfections: input.highlights ?? "",
      sellerContext: {
        tone: input.tone ?? "",
        audiencePreset: input.audiencePreset ?? null,
      },
      readinessContext: readiness,
    }),
  ];
  lines.push(
    "",
    `Respond with JSON exactly shaped as:
{"title":"...","titleOptions":["..."],"shortSummary":"...","description":"...","conditionSummary":"...","missingInfo":["..."],"riskFlags":["..."],"readinessScore":0,"readinessReasons":["..."],"disclosureSuggestions":["..."]}`
  );
  return lines.join("\n");
}

function mergeByScope(
  intake: ListingAiGenerateBody,
  out: ListingAiStructuredResult,
  scope: ListingAiWizardScope
): ListingAiStructuredResult {
  const readiness = deriveListingReadinessSnapshot(intake);
  const titleOptions = Array.from(
    new Set([out.title, ...(out.titleOptions ?? [])].map((v) => v.trim()).filter(Boolean))
  ).slice(0, 4);
  const base: ListingAiStructuredResult = {
    ...out,
    titleOptions,
    shortSummary: out.shortSummary?.trim() ?? "",
    missingInfo: Array.from(new Set([...(out.missingInfo ?? []), ...readiness.missingInfo])).slice(0, 8),
    riskFlags: Array.from(new Set([...(out.riskFlags ?? []), ...readiness.riskFlags])).slice(0, 6),
    readinessScore:
      typeof out.readinessScore === "number" && out.readinessScore > 0
        ? Math.round((out.readinessScore + readiness.readinessScore) / 2)
        : readiness.readinessScore,
    readinessReasons: Array.from(
      new Set([...(out.readinessReasons ?? []), ...readiness.readinessReasons])
    ).slice(0, 6),
    disclosureSuggestions: Array.from(
      new Set(out.disclosureSuggestions ?? [])
    ).slice(0, 6),
  };

  if (scope === "full") {
    const cs = base.conditionSummary?.trim();
    if (!cs) return { ...base, conditionSummary: undefined };
    return { ...base, conditionSummary: cs };
  }

  if (scope === "condition") {
    const title = intake.title?.trim() || base.title;
    const description = intake.description?.trim() || base.description;
    const cs = base.conditionSummary?.trim() ?? "";
    return { ...base, title, description, ...(cs ? { conditionSummary: cs } : {}) };
  }

  // imperfections
  const title = intake.title?.trim() || base.title;
  const cs =
    intake.conditionSummary?.trim() ||
    base.conditionSummary?.trim() ||
    "";
  return {
    ...base,
    title,
    description: base.description,
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
