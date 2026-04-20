import { openAiChatJsonObject } from "@/lib/marketing/marketing-copilot-openai";
import {
  listingAiStructuredResultSchema,
  type ListingAiGenerateBody,
  type ListingAiStructuredResult,
} from "@/lib/validations/listing-ai";

const SYSTEM = `You are an expert automotive listing editor for Carasta, a collector and enthusiast marketplace.
Return a single JSON object only (no markdown) with keys:
- "title": compelling auction title, max 200 chars, factual.
- "description": 2–6 short paragraphs: condition, notable options, service history if implied by input, why it matters to buyers. No false claims; if unknown, say so briefly. Plain text, no HTML.
- "conditionSummary": optional 1–3 sentences summarizing condition for a condition field; omit key or use empty string if nothing to add.

Rules:
- Never invent VIN decode, accident history, or legal guarantees.
- Match year/make/model/trim from input; do not change year.
- Tone: confident, specific, enthusiast-friendly; avoid ALL CAPS shouting.
- If intake includes seller "highlights", weave them naturally; do not contradict other fields.`;

function buildUserPrompt(input: ListingAiGenerateBody): string {
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

export async function generateListingAiCopy(
  intake: ListingAiGenerateBody
): Promise<ListingAiStructuredResult> {
  const raw = await openAiChatJsonObject({
    system: SYSTEM,
    user: buildUserPrompt(intake),
  });
  const parsed = listingAiStructuredResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Model returned listing fields that failed validation.");
  }
  const out = parsed.data;
  const cs = out.conditionSummary?.trim();
  if (!cs) {
    return { title: out.title, description: out.description };
  }
  return { title: out.title, description: out.description, conditionSummary: cs };
}
