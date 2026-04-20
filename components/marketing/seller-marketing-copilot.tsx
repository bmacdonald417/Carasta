"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MARKETING_COPILOT_CHANNEL_KEYS,
  type MarketingCopilotChannelKey,
  type MarketingCopilotStructuredResult,
} from "@/lib/validations/marketing-copilot";

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
  }, []);

  const generate = useCallback(async () => {
    if (selectedChannels.size === 0) {
      setError("Pick at least one channel.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/copilot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          objectiveGoal,
          audience,
          positioning,
          channels: Array.from(selectedChannels),
          tone,
          budgetLevel,
          urgency,
          listingHighlights,
        }),
      });
      const j = (await res.json()) as { copilot?: MarketingCopilotStructuredResult; message?: string };
      if (!res.ok) {
        throw new Error(j.message ?? "Generation failed.");
      }
      if (!j.copilot) throw new Error("Missing copilot payload.");
      setDraft(j.copilot);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
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

  const apply = useCallback(async () => {
    if (!draft) return;
    setError(null);
    setApplying(true);
    try {
      const res = await fetch("/api/marketing/copilot/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId, copilot: draft }),
      });
      const j = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(j.message ?? "Apply failed.");
      await onApplied();
      resetToIdle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Apply failed.");
    } finally {
      setApplying(false);
    }
  }, [auctionId, draft, onApplied, resetToIdle]);

  return (
    <div className="rounded-2xl border border-[#ff3b5c]/25 bg-gradient-to-b from-[#ff3b5c]/[0.07] to-transparent p-6">
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
                Outputs are suggestions, not guarantees. Applying updates your workspace plan, appends
                AI-labeled checklist items, and adds new draft versions — existing history is kept.
              </p>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-neutral-100">Plan</h3>
                <p className="mt-2 text-sm text-neutral-300">{draft.plan.summaryStrategy}</p>
                <dl className="mt-4 grid gap-3 text-sm text-neutral-400 md:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-neutral-600">Objective</dt>
                    <dd className="mt-1 text-neutral-200">{draft.plan.objective}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-neutral-600">Audience</dt>
                    <dd className="mt-1 text-neutral-200">{draft.plan.audience}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-xs uppercase text-neutral-600">Positioning</dt>
                    <dd className="mt-1 text-neutral-200">{draft.plan.positioning}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-xs uppercase text-neutral-600">Channels</dt>
                    <dd className="mt-1 text-neutral-200">{draft.plan.channels.join(", ")}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-neutral-100">Checklist ({draft.tasks.length})</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                  {draft.tasks.map((t, i) => (
                    <li key={i} className="rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                      <span className="font-medium text-neutral-100">{t.title}</span>
                      {t.description ? (
                        <p className="mt-1 text-xs text-neutral-500">{t.description}</p>
                      ) : null}
                      {t.channel ? (
                        <p className="mt-1 text-[10px] uppercase text-neutral-600">{t.channel}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-neutral-100">Drafts ({draft.artifacts.length})</h3>
                <ul className="mt-3 space-y-3">
                  {draft.artifacts.map((a, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-white/5 bg-black/30 p-3 text-sm text-neutral-300"
                    >
                      <p className="text-xs text-neutral-500">
                        {a.type}
                        {a.channel ? ` · ${a.channel}` : ""}
                      </p>
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-sans text-xs text-neutral-200">
                        {a.content}
                      </pre>
                    </li>
                  ))}
                </ul>
              </section>

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
    </div>
  );
}
