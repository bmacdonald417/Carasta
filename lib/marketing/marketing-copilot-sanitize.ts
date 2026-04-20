import {
  marketingCopilotArtifactBlockSchema,
  marketingCopilotStructuredResultSchema,
  marketingCopilotTaskBlockSchema,
} from "@/lib/validations/marketing-copilot";
import type {
  MarketingCopilotArtifactBlock,
  MarketingCopilotStructuredResult,
  MarketingCopilotTaskBlock,
} from "@/lib/validations/marketing-copilot";

const BANNED_PHRASES: Array<{ re: RegExp; replacement: string }> = [
  { re: /\b100%\s*guaranteed\b/gi, replacement: "not guaranteed" },
  { re: /\bgo\s*viral\b/gi, replacement: "reach people" },
  { re: /\bguaranteed\s*(results|views|bids|sales)\b/gi, replacement: "not guaranteed outcomes" },
  { re: /\bdefinitely\s*(will|going\s*to)\b/gi, replacement: "may" },
  { re: /\blegal\s*certainty\b/gi, replacement: "general guidance" },
];

function clampText(s: string, max: number): string {
  const t = s.replace(/\u0000/g, "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function scrub(s: string, max: number): string {
  let out = clampText(s, max);
  for (const { re, replacement } of BANNED_PHRASES) {
    out = out.replace(re, replacement);
  }
  return out;
}

/**
 * Post-parse hygiene: clamp lengths, strip control chars, soften risky absolutes.
 */
export function sanitizeCopilotStructuredResult(
  input: MarketingCopilotStructuredResult
): MarketingCopilotStructuredResult {
  const draft: MarketingCopilotStructuredResult = {
    plan: {
      objective: scrub(input.plan.objective, 20_000),
      audience: scrub(input.plan.audience, 20_000),
      positioning: scrub(input.plan.positioning, 20_000),
      channels: input.plan.channels.map((c) => scrub(c, 64)).slice(0, 32),
      summaryStrategy: scrub(input.plan.summaryStrategy, 20_000),
    },
    tasks: input.tasks.map((t) => ({
      ...t,
      title: scrub(t.title, 500),
      description: scrub(t.description ?? "", 20_000),
      channel: t.channel == null ? null : scrub(String(t.channel), 64),
    })),
    artifacts: input.artifacts.map((a) => ({
      ...a,
      channel: scrub(a.channel ?? "", 64),
      content: scrub(a.content, 100_000),
    })),
  };

  const parsed = marketingCopilotStructuredResultSchema.safeParse(draft);
  if (!parsed.success) {
    return input;
  }
  return parsed.data;
}

export function sanitizeTaskBlock(input: MarketingCopilotTaskBlock): MarketingCopilotTaskBlock {
  const draft = {
    ...input,
    title: scrub(input.title, 500),
    description: scrub(input.description ?? "", 20_000),
    channel: input.channel == null ? null : scrub(String(input.channel), 64),
  };
  return marketingCopilotTaskBlockSchema.parse(draft);
}

export function sanitizeArtifactBlock(input: MarketingCopilotArtifactBlock): MarketingCopilotArtifactBlock {
  const draft = {
    ...input,
    channel: scrub(input.channel ?? "", 64),
    content: scrub(input.content, 100_000),
  };
  return marketingCopilotArtifactBlockSchema.parse(draft);
}
