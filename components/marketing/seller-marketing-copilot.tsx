"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, FileDown, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { ListingMarketingArtifactType, ListingMarketingTaskType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MARKETING_COPILOT_CHANNEL_KEYS,
  type MarketingCopilotChannelKey,
  type MarketingCopilotGenerateBody,
  type MarketingCopilotStructuredResult,
} from "@/lib/validations/marketing-copilot";
import { MarketingCopilotIntakeMetricsPanel } from "@/components/marketing/marketing-copilot-intake-metrics-panel";
import { MarketingCopilotRunHistory } from "@/components/marketing/marketing-copilot-run-history";
import type { MarketingCopilotIntakeMetricsSnapshot } from "@/lib/marketing/marketing-copilot-intake-metrics";

const OBJECTIVE_OPTIONS = [
  { value: "Sell faster — prioritize liquidity and clear next steps.", label: "Sell faster" },
  { value: "Drive bids — sharpen urgency and trust signals for bidders.", label: "Drive bids" },
  { value: "Increase visibility — expand reach across selected channels.", label: "Increase visibility" },
  { value: "Target collectors — emphasize provenance, rarity, and care story.", label: "Target collectors" },
] as const;

const CHANNEL_LABELS: Record<MarketingCopilotChannelKey, string> = {
  carmunity: "Carmunity",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X (Twitter)",
  google: "Google (Search / Ads education)",
  forums: "Forums / communities",
  email: "Email / direct outreach",
};

export type SellerMarketingListingCapsule = {
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  status: string;
  description: string | null;
  conditionSummary: string | null;
  sellerHandle: string;
};

type Props = {
  auctionId: string;
  listingCapsule: SellerMarketingListingCapsule;
  /** Dashboard snapshot for intake (optional). */
  intakeMetrics?: MarketingCopilotIntakeMetricsSnapshot | null;
  /** Current workspace plan (optional) — used to prefill intake. */
  workspacePlan: {
    id: string;
    objective: string;
    audience: string;
    positioning: string;
    channels: unknown;
  } | null;
  copilotConfigured: boolean;
  onApplied: () => Promise<void>;
};

type Step = "idle" | "intake" | "review";

function parseChannelsFromPlan(channels: unknown): Set<string> {
  const set = new Set<string>();
  if (Array.isArray(channels)) {
    for (const c of channels) {
      if (typeof c === "string" && (MARKETING_COPILOT_CHANNEL_KEYS as readonly string[]).includes(c)) {
        set.add(c);
      }
    }
  }
  return set;
}

export function SellerMarketingCopilot({
  auctionId,
  listingCapsule,
  intakeMetrics = null,
  workspacePlan,
  copilotConfigured,
  onApplied,
}: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [objectiveGoal, setObjectiveGoal] = useState<string>(OBJECTIVE_OPTIONS[0].value);
  const [audience, setAudience] = useState(workspacePlan?.audience ?? "");
  const [positioning, setPositioning] = useState(workspacePlan?.positioning ?? "");
  const [tone, setTone] = useState("");
  const [budgetLevel, setBudgetLevel] = useState("");
  const [urgency, setUrgency] = useState("");
  const [listingHighlights, setListingHighlights] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(() => {
    const fromPlan = parseChannelsFromPlan(workspacePlan?.channels);
    if (fromPlan.size > 0) return fromPlan;
    return new Set<string>(["carmunity", "instagram"]);
  });

  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MarketingCopilotStructuredResult | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [lastIntake, setLastIntake] = useState<MarketingCopilotGenerateBody | null>(null);
  const [regenTaskIdx, setRegenTaskIdx] = useState<number | null>(null);
  const [regenArtIdx, setRegenArtIdx] = useState<number | null>(null);
  const [historyTick, setHistoryTick] = useState(0);

  const vehicleLine = useMemo(
    () =>
      [listingCapsule.year, listingCapsule.make, listingCapsule.model, listingCapsule.trim]
        .filter(Boolean)
        .join(" "),
    [listingCapsule]
  );

  const toggleChannel = useCallback((key: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const resetToIdle = useCallback(() => {
    setStep("idle");
    setDraft(null);
    setError(null);
    setRunId(null);
    setLastIntake(null);
    setRegenTaskIdx(null);
    setRegenArtIdx(null);
  }, []);

  const buildIntakePayload = useCallback((): MarketingCopilotGenerateBody => {
    return {
      auctionId,
      objectiveGoal,
      audience,
      positioning,
      channels: Array.from(selectedChannels) as MarketingCopilotGenerateBody["channels"],
      tone,
      budgetLevel,
      urgency,
      listingHighlights,
    };
  }, [
    auctionId,
    audience,
    budgetLevel,
    listingHighlights,
    objectiveGoal,
    positioning,
    selectedChannels,
    tone,
    urgency,
  ]);

  const updatePlanField = useCallback(
    (key: keyof MarketingCopilotStructuredResult["plan"], value: string | string[]) => {
      setDraft((d) => {
        if (!d) return d;
        return { ...d, plan: { ...d.plan, [key]: value } as typeof d.plan };
      });
    },
    []
  );

  const updateTaskRow = useCallback((idx: number, patch: Partial<MarketingCopilotStructuredResult["tasks"][number]>) => {
    setDraft((d) => {
      if (!d) return d;
      const tasks = d.tasks.map((t, i) => (i === idx ? { ...t, ...patch } : t));
      return { ...d, tasks };
    });
  }, []);

  const updateArtifactRow = useCallback(
    (idx: number, patch: Partial<MarketingCopilotStructuredResult["artifacts"][number]>) => {
      setDraft((d) => {
        if (!d) return d;
        const artifacts = d.artifacts.map((a, i) => (i === idx ? { ...a, ...patch } : a));
        return { ...d, artifacts };
      });
    },
    []
  );

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError(`Could not copy ${label}.`);
    }
  }, []);

  const downloadTextFile = useCallback((filename: string, contents: string, mime: string) => {
    const blob = new Blob([contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportDraftJson = useCallback(() => {
    if (!draft) return;
    downloadTextFile(
      `copilot-draft-${auctionId}.json`,
      JSON.stringify({ runId, intake: lastIntake, copilot: draft }, null, 2),
      "application/json"
    );
  }, [auctionId, downloadTextFile, draft, lastIntake, runId]);

  const exportDraftMarkdown = useCallback(() => {
    if (!draft) return;
    const lines: string[] = [];
    lines.push(`# Copilot draft`, ``, `## Plan`, `- Objective: ${draft.plan.objective}`, `- Audience: ${draft.plan.audience}`, `- Positioning: ${draft.plan.positioning}`, `- Channels: ${draft.plan.channels.join(", ")}`, ``, `### Strategy`, draft.plan.summaryStrategy, ``, `## Tasks`);
    draft.tasks.forEach((t, i) => {
      lines.push(`${i + 1}. **${t.title}**`, t.description ? `   ${t.description}` : "", t.channel ? `   _${t.channel}_` : "");
    });
    lines.push(``, `## Artifacts`);
    draft.artifacts.forEach((a, i) => {
      lines.push(`### ${i + 1}. ${a.type}${a.channel ? ` · ${a.channel}` : ""}`, "```", a.content, "```", "");
    });
    downloadTextFile(`copilot-draft-${auctionId}.md`, lines.join("\n"), "text/markdown;charset=utf-8");
  }, [auctionId, downloadTextFile, draft]);

  const generate = useCallback(async () => {
    if (selectedChannels.size === 0) {
      setError("Pick at least one channel.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const intake = buildIntakePayload();
      const res = await fetch("/api/marketing/copilot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });
      const j = (await res.json()) as {
        copilot?: MarketingCopilotStructuredResult;
        runId?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(j.message ?? "Generation failed.");
      }
      if (!j.copilot) throw new Error("Missing copilot payload.");
      setDraft(j.copilot);
      setRunId(j.runId ?? null);
      setLastIntake(intake);
      setStep("review");
      setHistoryTick((t) => t + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }, [buildIntakePayload, selectedChannels]);

  const apply = useCallback(async () => {
    if (!draft) return;
    setError(null);
    setApplying(true);
    try {
      const res = await fetch("/api/marketing/copilot/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          copilot: draft,
          ...(runId ? { runId } : {}),
        }),
      });
      const j = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(j.message ?? "Apply failed.");
      await onApplied();
      resetToIdle();
      window.setTimeout(() => {
        document.getElementById("marketing-workspace")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
      setHistoryTick((t) => t + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Apply failed.");
    } finally {
      setApplying(false);
    }
  }, [auctionId, draft, onApplied, resetToIdle, runId]);

  const regenerateTask = useCallback(
    async (idx: number) => {
      if (!draft || !lastIntake) {
        setError("Generate a draft first before regenerating a single task.");
        return;
      }
      setError(null);
      setRegenTaskIdx(idx);
      try {
        const res = await fetch("/api/marketing/copilot/regenerate-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auctionId,
            intake: lastIntake,
            task: draft.tasks[idx],
          }),
        });
        const j = (await res.json()) as {
          task?: MarketingCopilotStructuredResult["tasks"][number];
          runId?: string;
          message?: string;
        };
        if (!res.ok) throw new Error(j.message ?? "Regeneration failed.");
        if (!j.task) throw new Error("Missing task.");
        updateTaskRow(idx, j.task);
        if (j.runId) setRunId(j.runId);
        setHistoryTick((t) => t + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Regeneration failed.");
      } finally {
        setRegenTaskIdx(null);
      }
    },
    [auctionId, draft, lastIntake, updateTaskRow]
  );

  const regenerateArtifact = useCallback(
    async (idx: number) => {
      if (!draft || !lastIntake) {
        setError("Generate a draft first before regenerating a single draft.");
        return;
      }
      setError(null);
      setRegenArtIdx(idx);
      try {
        const res = await fetch("/api/marketing/copilot/regenerate-artifact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auctionId,
            intake: lastIntake,
            artifact: draft.artifacts[idx],
          }),
        });
        const j = (await res.json()) as {
          artifact?: MarketingCopilotStructuredResult["artifacts"][number];
          runId?: string;
          message?: string;
        };
        if (!res.ok) throw new Error(j.message ?? "Regeneration failed.");
        if (!j.artifact) throw new Error("Missing artifact.");
        updateArtifactRow(idx, j.artifact);
        if (j.runId) setRunId(j.runId);
        setHistoryTick((t) => t + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Regeneration failed.");
      } finally {
        setRegenArtIdx(null);
      }
    },
    [auctionId, draft, lastIntake, updateArtifactRow]
  );

  return (
    <div
      id="marketing-ai-copilot"
      className="scroll-mt-32 rounded-2xl border border-[#ff3b5c]/25 bg-gradient-to-b from-[#ff3b5c]/[0.07] to-transparent p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#ff3b5c]">
            <Sparkles className="h-5 w-5 shrink-0" />
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              AI marketing copilot
            </h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Listing-aware plan, checklist, and channel drafts. Review before saving — nothing is
            auto-posted.
          </p>
          {!copilotConfigured ? (
            <p className="mt-2 text-xs text-amber-200/90">
              Copilot is disabled until <code className="rounded bg-black/40 px-1">OPENAI_API_KEY</code>{" "}
              is set on the server.
            </p>
          ) : null}
        </div>
        {step === "idle" ? (
          <Button
            type="button"
            size="sm"
            className="shrink-0 bg-[#ff3b5c] text-white hover:bg-[#ff3b5c]/90"
            disabled={!copilotConfigured}
            onClick={() => {
              setError(null);
              if (workspacePlan) {
                setAudience(workspacePlan.audience ?? "");
                setPositioning(workspacePlan.positioning ?? "");
                setSelectedChannels(parseChannelsFromPlan(workspacePlan.channels));
              }
              setStep("intake");
            }}
          >
            Generate plan with AI
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={resetToIdle}>
            Close
          </Button>
        )}
      </div>

      {step !== "idle" ? (
        <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
          {error ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {step === "intake" ? (
            <>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Listing context (read-only)
                </p>
                <p className="mt-2 font-medium text-neutral-100">{listingCapsule.title}</p>
                <p className="mt-1 text-neutral-400">{vehicleLine}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Status {listingCapsule.status}
                  {listingCapsule.mileage != null ? ` · ${listingCapsule.mileage.toLocaleString()} mi` : ""}
                </p>
                {listingCapsule.description ? (
                  <p className="mt-3 line-clamp-4 text-neutral-400">{listingCapsule.description}</p>
                ) : (
                  <p className="mt-3 text-xs text-neutral-600">No description on file — add highlights below.</p>
                )}
              </div>

              {intakeMetrics ? (
                <MarketingCopilotIntakeMetricsPanel
                  metrics={intakeMetrics}
                  urgency={urgency}
                  onApplyTimingHint={(text) => setUrgency(text)}
                />
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-medium text-neutral-400">Primary goal</p>
                  <select
                    className="h-10 w-full max-w-xl rounded-md border border-white/10 bg-black/30 px-2 text-sm text-neutral-100"
                    value={objectiveGoal}
                    onChange={(e) => setObjectiveGoal(e.target.value)}
                  >
                    {OBJECTIVE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-400">Audience</p>
                  <Textarea
                    rows={3}
                    className="resize-y bg-black/30"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Who is the likely buyer?"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-400">Positioning angle</p>
                  <Textarea
                    rows={3}
                    className="resize-y bg-black/30"
                    value={positioning}
                    onChange={(e) => setPositioning(e.target.value)}
                    placeholder="Why this car, why buy from you…"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-medium text-neutral-400">Channels</p>
                  <div className="flex flex-wrap gap-3">
                    {MARKETING_COPILOT_CHANNEL_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-neutral-200 hover:bg-black/40"
                      >
                        <input
                          type="checkbox"
                          className="accent-[#ff3b5c]"
                          checked={selectedChannels.has(key)}
                          onChange={() => toggleChannel(key)}
                        />
                        {CHANNEL_LABELS[key]}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-400">Tone (optional)</p>
                  <Input
                    className="bg-black/30"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g. confident, understated, technical"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-400">Budget level (optional)</p>
                  <Input
                    className="bg-black/30"
                    value={budgetLevel}
                    onChange={(e) => setBudgetLevel(e.target.value)}
                    placeholder="e.g. mostly organic, light paid boost"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-400">Urgency (optional)</p>
                  <Input
                    className="bg-black/30"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    placeholder="e.g. auction ends in 5 days"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-medium text-neutral-400">
                    What makes this listing special? (optional)
                  </p>
                  <Textarea
                    rows={3}
                    className="resize-y bg-black/30"
                    value={listingHighlights}
                    onChange={(e) => setListingHighlights(e.target.value)}
                    placeholder="Service history, originality, recent work — only facts you can stand behind."
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  disabled={generating || !copilotConfigured}
                  className="bg-[#ff3b5c] text-white hover:bg-[#ff3b5c]/90"
                  onClick={() => void generate()}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    "Generate draft"
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={resetToIdle}>
                  Cancel
                </Button>
              </div>
            </>
          ) : null}

          {step === "review" && draft ? (
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Step 2 — Review before saving
              </p>
              <p className="text-xs text-neutral-500">
                Outputs are suggestions, not guarantees. Edit anything below before applying. Trackable
                listing links are added on apply. Applying updates your workspace plan, appends AI-labeled
                checklist items, and adds new draft versions — existing history is kept.
              </p>

              {runId ? (
                <p className="text-[11px] text-neutral-600">
                  Audit run ID: <span className="font-mono text-neutral-400">{runId}</span>
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => void exportDraftJson()}>
                  <FileDown className="mr-1.5 h-3.5 w-3.5" />
                  Export JSON
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void exportDraftMarkdown()}>
                  <FileDown className="mr-1.5 h-3.5 w-3.5" />
                  Export Markdown
                </Button>
              </div>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-neutral-100">Plan</h3>
                <div className="mt-3 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-500">Strategy summary</p>
                    <Textarea
                      rows={4}
                      className="resize-y bg-black/30 text-sm"
                      value={draft.plan.summaryStrategy}
                      onChange={(e) => updatePlanField("summaryStrategy", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Objective</p>
                      <Textarea
                        rows={3}
                        className="resize-y bg-black/30 text-sm"
                        value={draft.plan.objective}
                        onChange={(e) => updatePlanField("objective", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Audience</p>
                      <Textarea
                        rows={3}
                        className="resize-y bg-black/30 text-sm"
                        value={draft.plan.audience}
                        onChange={(e) => updatePlanField("audience", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-medium text-neutral-500">Positioning</p>
                      <Textarea
                        rows={3}
                        className="resize-y bg-black/30 text-sm"
                        value={draft.plan.positioning}
                        onChange={(e) => updatePlanField("positioning", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-medium text-neutral-500">Channels (comma-separated)</p>
                      <Input
                        className="bg-black/30 text-sm"
                        value={draft.plan.channels.join(", ")}
                        onChange={(e) => {
                          const parts = e.target.value
                            .split(/[,;]/)
                            .map((s) => s.trim())
                            .filter(Boolean);
                          updatePlanField("channels", parts.length > 0 ? parts : draft.plan.channels);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-neutral-100">Checklist ({draft.tasks.length})</h3>
                <ul className="mt-3 space-y-4 text-sm text-neutral-300">
                  {draft.tasks.map((t, i) => (
                    <li key={`task-${i}`} className="rounded-lg border border-white/5 bg-black/30 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] uppercase text-neutral-600">Task {i + 1}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                            onClick={() =>
                              void copyText(
                                "task",
                                [t.title, t.description, t.channel].filter(Boolean).join("\n\n")
                              )
                            }
                          >
                            <Copy className="mr-1 h-3.5 w-3.5" />
                            Copy
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            disabled={
                              !copilotConfigured ||
                              !lastIntake ||
                              regenTaskIdx !== null ||
                              regenArtIdx !== null ||
                              applying
                            }
                            onClick={() => void regenerateTask(i)}
                          >
                            {regenTaskIdx === i ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-1 h-3.5 w-3.5" />
                            )}
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        <Input
                          className="bg-black/40 text-sm font-medium"
                          value={t.title}
                          onChange={(e) => updateTaskRow(i, { title: e.target.value })}
                        />
                        <Textarea
                          rows={3}
                          className="resize-y bg-black/40 text-xs"
                          value={t.description ?? ""}
                          onChange={(e) => updateTaskRow(i, { description: e.target.value })}
                        />
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-neutral-600">Channel hint</p>
                            <Input
                              className="bg-black/40 text-xs"
                              value={t.channel ?? ""}
                              onChange={(e) =>
                                updateTaskRow(i, { channel: e.target.value.trim() ? e.target.value : null })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase text-neutral-600">Type</p>
                            <select
                              className="h-9 w-full rounded-md border border-white/10 bg-black/40 px-2 text-xs text-neutral-100"
                              value={t.type ?? ListingMarketingTaskType.CHECKLIST}
                              onChange={(e) =>
                                updateTaskRow(i, { type: e.target.value as ListingMarketingTaskType })
                              }
                            >
                              {Object.values(ListingMarketingTaskType).map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-neutral-100">Drafts ({draft.artifacts.length})</h3>
                <ul className="mt-3 space-y-4">
                  {draft.artifacts.map((a, i) => (
                    <li
                      key={`artifact-${i}`}
                      className="rounded-lg border border-white/5 bg-black/30 p-3 text-sm text-neutral-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-neutral-500">
                          Draft {i + 1}
                          {a.channel ? ` · ${a.channel}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                            onClick={() => void copyText("artifact", a.content)}
                          >
                            <Copy className="mr-1 h-3.5 w-3.5" />
                            Copy
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            disabled={
                              !copilotConfigured ||
                              !lastIntake ||
                              regenTaskIdx !== null ||
                              regenArtIdx !== null ||
                              applying
                            }
                            onClick={() => void regenerateArtifact(i)}
                          >
                            {regenArtIdx === i ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-1 h-3.5 w-3.5" />
                            )}
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-neutral-600">Type</p>
                          <select
                            className="h-9 w-full rounded-md border border-white/10 bg-black/40 px-2 text-xs text-neutral-100"
                            value={a.type}
                            onChange={(e) =>
                              updateArtifactRow(i, { type: e.target.value as ListingMarketingArtifactType })
                            }
                          >
                            {Object.values(ListingMarketingArtifactType).map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-neutral-600">Channel</p>
                          <Input
                            className="bg-black/40 text-xs"
                            value={a.channel}
                            onChange={(e) => updateArtifactRow(i, { channel: e.target.value })}
                          />
                        </div>
                      </div>
                      <Textarea
                        rows={8}
                        className="mt-2 max-h-64 resize-y bg-black/40 font-sans text-xs text-neutral-200"
                        value={a.content}
                        onChange={(e) => updateArtifactRow(i, { content: e.target.value })}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              <p className="text-[11px] text-neutral-600">
                After a successful save, we scroll you to the{" "}
                <span className="text-neutral-400">Marketing workspace</span> block below so you can
                edit the plan, checklist, and drafts.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("intake")}>
                  Back to inputs
                </Button>
                <Button
                  type="button"
                  className="bg-[#ff3b5c] text-white hover:bg-[#ff3b5c]/90"
                  disabled={applying}
                  onClick={() => void apply()}
                >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying…
                    </>
                  ) : (
                    "Apply to workspace"
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <MarketingCopilotRunHistory auctionId={auctionId} enabled={true} refreshKey={historyTick} />
    </div>
  );
}
