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
      whyNow: scrub(input.plan.whyNow ?? "", 8_000),
      workflowMode: input.plan.workflowMode ?? "launch",
    },
    priorityActions: (input.priorityActions ?? []).map((a) => ({
      ...a,
      title: scrub(a.title, 500),
      actionNow: scrub(a.actionNow, 10_000),
      whyThisMatters: scrub(a.whyThisMatters, 10_000),
      channel: a.channel == null ? null : scrub(String(a.channel), 64),
      tone: a.tone ?? "info",
    })),
    channelPlaybooks: (input.channelPlaybooks ?? []).map((p) => ({
      ...p,
      audienceFit: scrub(p.audienceFit, 10_000),
      whyThisChannel: scrub(p.whyThisChannel, 10_000),
      cadence: scrub(p.cadence, 10_000),
      messagingAngle: scrub(p.messagingAngle, 10_000),
      ctaGuidance: scrub(p.ctaGuidance, 10_000),
      assetSuggestions: (p.assetSuggestions ?? []).map((v) => scrub(v, 500)).slice(0, 8),
      doNotes: (p.doNotes ?? []).map((v) => scrub(v, 500)).slice(0, 8),
      avoidNotes: (p.avoidNotes ?? []).map((v) => scrub(v, 500)).slice(0, 8),
    })),
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
    watchouts: (input.watchouts ?? []).map((w) => ({
      title: scrub(w.title, 300),
      detail: scrub(w.detail, 10_000),
    })),
    measurementPlan: (input.measurementPlan ?? []).map((m) => ({
      metric: scrub(m.metric, 300),
      whyThisMatters: scrub(m.whyThisMatters, 10_000),
      targetSignal: scrub(m.targetSignal ?? "", 500),
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
