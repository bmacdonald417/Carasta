import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
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
  if (body.title?.trim()) lines.push(`Listing title: ${body.title.trim()}`);
  if (body.description?.trim()) {
    lines.push(`Other description context (may shorten in your head; only output the requested field):\n${body.description.trim().slice(0, 4000)}`);
  }
  if (body.conditionSummary?.trim()) {
    lines.push(`Condition summary context:\n${body.conditionSummary.trim().slice(0, 2000)}`);
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
