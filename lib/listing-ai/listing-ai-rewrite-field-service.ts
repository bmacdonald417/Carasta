import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import { deriveListingReadinessSnapshot } from "@/lib/listing-ai/listing-ai-readiness";
import {
  listingAiRewriteFieldResultSchema,
  type ListingAiRewriteFieldBody,
} from "@/lib/validations/listing-ai";
import { getListingAiModel } from "@/lib/listing-ai/listing-ai-model";

const SYSTEM = `You are an expert automotive listing editor for Carasta.
Return a single JSON object only (no markdown) with one key: "text" — the improved field value.
Rules:
- Do not invent history, accidents, service, or legal claims.
- Preserve factual meaning; tighten wording, fix grammar, improve scanability.
- Keep unsupported unknowns explicit instead of smoothing them away.
- Plain text only (no HTML).`;

function maxLen(field: ListingAiRewriteFieldBody["field"]): number {
  if (field === "title") return 200;
  if (field === "conditionSummary") return 8000;
  return 20000;
}

function buildUserPrompt(input: {
  body: ListingAiRewriteFieldBody;
  currentValue: string;
}): string {
  const { body, currentValue } = input;
  const readiness = deriveListingReadinessSnapshot({
    description: body.description,
    conditionSummary: body.conditionSummary,
    mileage: body.mileage,
    conditionGrade: body.conditionGrade,
    audiencePreset: body.audiencePreset,
    ownershipDuration: body.ownershipDuration,
    serviceHistoryConfidence: body.serviceHistoryConfidence,
    modifications: body.modifications,
    originality: body.originality,
    documentationAvailable: body.documentationAvailable,
    sellingReason: body.sellingReason,
  });
  const vehicle = [
    body.year,
    body.make,
    body.model,
    body.trim ? body.trim : null,
  ]
    .filter(Boolean)
    .join(" ");
  const lines: string[] = [
    `Field to improve: ${body.field}`,
    `Vehicle context: ${vehicle || "(see listing)"}`,
  ];
  if (body.mileage != null) lines.push(`Mileage: ${body.mileage}`);
  if (body.vin) lines.push(`VIN (opaque; do not decode): ${body.vin}`);
  if (body.conditionGrade) lines.push(`Condition grade: ${body.conditionGrade}`);
  if (body.audiencePreset) lines.push(`Audience preset: ${body.audiencePreset}`);
  if (body.ownershipDuration?.trim()) lines.push(`Ownership duration: ${body.ownershipDuration.trim()}`);
  if (body.serviceHistoryConfidence) {
    lines.push(`Service history confidence: ${body.serviceHistoryConfidence}`);
  }
  if (body.modifications?.trim()) lines.push(`Modifications: ${body.modifications.trim()}`);
  if (body.originality?.trim()) lines.push(`Originality: ${body.originality.trim()}`);
  if (body.documentationAvailable?.trim()) {
    lines.push(`Documentation available: ${body.documentationAvailable.trim()}`);
  }
  if (body.sellingReason?.trim()) lines.push(`Selling reason: ${body.sellingReason.trim()}`);
  if (body.title?.trim()) lines.push(`Listing title: ${body.title.trim()}`);
  if (body.description?.trim()) {
    lines.push(`Other description context (may shorten in your head; only output the requested field):\n${body.description.trim().slice(0, 4000)}`);
  }
  if (body.conditionSummary?.trim()) {
    lines.push(`Condition summary context:\n${body.conditionSummary.trim().slice(0, 2000)}`);
  }
  if (readiness.missingInfo.length > 0) {
    lines.push(`Known missing info: ${readiness.missingInfo.join(" | ")}`);
  }
  lines.push("", `Current ${body.field} value:`, currentValue.trim() || "(empty)");
  if (body.instruction?.trim()) {
    lines.push("", `Seller instruction: ${body.instruction.trim()}`);
  }
  lines.push("", `Respond as JSON: {"text":"..."}  Max length for this field: ${maxLen(body.field)} characters.`);
  return lines.join("\n");
}

export async function rewriteListingField(params: {
  body: ListingAiRewriteFieldBody;
  currentValue: string;
}): Promise<string> {
  const raw = await openAiChatJsonObject({
    system: SYSTEM,
    user: buildUserPrompt(params),
    model: getListingAiModel(),
    temperature: 0.4,
    maxTokens: params.body.field === "description" ? 1200 : 400,
  });
  const parsed = listingAiRewriteFieldResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Model returned invalid field rewrite.");
  }
  const cap = maxLen(params.body.field);
  return parsed.data.text.trim().slice(0, cap);
}
