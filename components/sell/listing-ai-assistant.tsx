"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type {
  ListingAiAudiencePreset,
  ListingAiStructuredResult,
  ListingAiWizardScope,
} from "@/lib/validations/listing-ai";

export type ListingAiIntakeSnapshot = {
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: string | number | "";
  vin: string;
  title: string;
  description: string;
  conditionSummary: string;
  /** When set (condition scope), sent as model context */
  conditionGrade?: string;
  audiencePreset?: ListingAiAudiencePreset;
  ownershipDuration?: string;
  serviceHistoryConfidence?: "documented" | "partial" | "unknown";
  modifications?: string;
  originality?: string;
  documentationAvailable?: string;
  sellingReason?: string;
};

export type ListingAiApplyPatch = Partial<{
  title: string;
  description: string;
  conditionSummary: string;
}>;

type ImperfectionRow = { location: string; description: string; severity: string };

function serializeImperfections(items: ImperfectionRow[]): string {
  const rows = items
    .filter((i) => i.description.trim())
    .map(
      (i) =>
        `- [${i.severity}] ${i.location.trim() || "Area"}: ${i.description.trim()}`
    );
  return rows.length ? rows.join("\n") : "";
}

type Props = {
  enabled: boolean;
  /** When refining server-backed draft/live listing. */
  auctionId?: string | null;
  /** full = step 1 listing draft; condition / imperfections = step 4 scoped helpers */
  scope?: ListingAiWizardScope;
  /** For scope "imperfections" — rows from the wizard; serialized into model context */
  imperfectionsForAi?: ImperfectionRow[];
  intake: ListingAiIntakeSnapshot;
  onApply: (patch: ListingAiApplyPatch) => void;
};

export function ListingAiAssistant({
  enabled,
  auctionId,
  scope = "full",
  imperfectionsForAi,
  intake,
  onApply,
}: Props) {
  const [highlights, setHighlights] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [audiencePreset, setAudiencePreset] = useState<ListingAiAudiencePreset>(
    intake.audiencePreset ?? "collector"
  );
  const [ownershipDuration, setOwnershipDuration] = useState(
    intake.ownershipDuration ?? ""
  );
  const [serviceHistoryConfidence, setServiceHistoryConfidence] = useState<
    "documented" | "partial" | "unknown"
  >(intake.serviceHistoryConfidence ?? "unknown");
  const [modifications, setModifications] = useState(intake.modifications ?? "");
  const [originality, setOriginality] = useState(intake.originality ?? "");
  const [documentationAvailable, setDocumentationAvailable] = useState(
    intake.documentationAvailable ?? ""
  );
  const [sellingReason, setSellingReason] = useState(intake.sellingReason ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    titleOptions?: string[];
    shortSummary?: string;
    description: string;
    conditionSummary?: string | null;
    missingInfo?: string[];
    riskFlags?: string[];
    readinessScore?: number;
    readinessReasons?: string[];
    disclosureSuggestions?: string[];
  } | null>(null);

  const imperfectionBlock = useMemo(
    () => serializeImperfections(imperfectionsForAi ?? []),
    [imperfectionsForAi]
  );

  const buildBody = useCallback(() => {
    const mileage =
      intake.mileage === "" ? undefined : Number(intake.mileage);
    const mergedHighlights =
      scope === "imperfections"
        ? [imperfectionBlock, highlights.trim()].filter(Boolean).join("\n\n")
        : highlights.trim() || undefined;

    return {
      ...(auctionId ? { auctionId } : {}),
      wizardScope: scope,
      year: intake.year,
      make: intake.make.trim() || "TBD",
      model: intake.model.trim() || "TBD",
      trim: intake.trim.trim() || undefined,
      mileage: Number.isFinite(mileage as number) ? (mileage as number) : undefined,
      vin: intake.vin.trim() || undefined,
      title: intake.title.trim() || undefined,
      description: intake.description.trim() || undefined,
      conditionSummary: intake.conditionSummary.trim() || undefined,
      conditionGrade: intake.conditionGrade?.trim() || undefined,
      highlights: mergedHighlights,
      tone: tone.trim() || undefined,
      audience: scope === "imperfections" ? undefined : audience.trim() || undefined,
      audiencePreset: scope === "full" ? audiencePreset : undefined,
      ownershipDuration: scope === "full" ? ownershipDuration.trim() || undefined : undefined,
      serviceHistoryConfidence:
        scope === "full" ? serviceHistoryConfidence || undefined : undefined,
      modifications: scope === "full" ? modifications.trim() || undefined : undefined,
      originality: scope === "full" ? originality.trim() || undefined : undefined,
      documentationAvailable:
        scope === "full" ? documentationAvailable.trim() || undefined : undefined,
      sellingReason: scope === "full" ? sellingReason.trim() || undefined : undefined,
    };
  }, [
    auctionId,
    audience,
    audiencePreset,
    highlights,
    imperfectionBlock,
    intake,
    modifications,
    originality,
    ownershipDuration,
    serviceHistoryConfidence,
    documentationAvailable,
    sellingReason,
    scope,
    tone,
  ]);

  const generate = useCallback(async () => {
    setError(null);
    if (scope === "imperfections" && !imperfectionBlock.trim() && !highlights.trim()) {
      setError("Add at least one imperfection or notes in the box below before generating.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/listings/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const j = (await res.json()) as {
        listing?: ListingAiStructuredResult;
        message?: string;
      };
      if (!res.ok) throw new Error(j.message ?? "Generation failed.");
      if (!j.listing) throw new Error("Missing listing payload.");
      setPreview(j.listing);
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }, [buildBody, highlights, imperfectionBlock, scope]);

  const heading =
    scope === "condition"
      ? "AI condition summary"
      : scope === "imperfections"
        ? "AI disclosures in description"
        : "AI listing assistant";

  const hint =
    scope === "condition"
      ? "Improves your condition summary from vehicle context and grade. Title and description stay as-is when already filled."
      : scope === "imperfections"
        ? "Rewrites the listing description to honestly incorporate your imperfection rows. Title and condition summary are preserved when already set."
        : "Draft title, description, and condition summary from your basics. Review before applying — nothing publishes until you submit the listing.";

  const generateLabel =
    scope === "condition"
      ? "Generate condition copy"
      : scope === "imperfections"
        ? "Refresh description"
        : "Generate draft";

  const applyLabel =
    scope === "condition"
      ? "Apply condition summary"
      : scope === "imperfections"
        ? "Apply description"
        : "Apply to form";

  const handleApply = useCallback(() => {
    if (!preview) return;
    if (scope === "condition") {
      onApply({
        conditionSummary: preview.conditionSummary ?? intake.conditionSummary,
      });
      return;
    }
    if (scope === "imperfections") {
      onApply({ description: preview.description });
      return;
    }
    onApply({
      title: preview.title,
      description: preview.description,
      conditionSummary: preview.conditionSummary ?? "",
    });
  }, [intake.conditionSummary, onApply, preview, scope]);

  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-[#ff3b5c]/25 bg-gradient-to-b from-[#ff3b5c]/[0.07] to-transparent p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#ff3b5c]">
            <Sparkles className="h-5 w-5 shrink-0" />
            <h3 className="font-display text-base font-semibold text-foreground">{heading}</h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{hint}</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 bg-[#ff3b5c] text-white hover:bg-[#ff3b5c]/90"
          disabled={busy}
          onClick={() => void generate()}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            generateLabel
          )}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
        {scope !== "imperfections" ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="listing-ai-highlights">Highlights / bullets (optional)</Label>
            <Textarea
              id="listing-ai-highlights"
              rows={3}
              className="resize-y bg-black/30"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Mods, recent service, paint film, track days, ownership…"
            />
          </div>
        ) : (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="listing-ai-imperfection-notes">
              Extra notes for disclosures (optional)
            </Label>
            <Textarea
              id="listing-ai-imperfection-notes"
              rows={2}
              className="resize-y bg-black/30"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Anything not captured in the rows above (e.g. prior paint work)…"
            />
          </div>
        )}
        {scope === "full" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-tone">Tone (optional)</Label>
              <Input
                id="listing-ai-tone"
                className="bg-black/30"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. technical, warm, concise"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-audience">Audience (optional)</Label>
              <Input
                id="listing-ai-audience"
                className="bg-black/30"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. track-day buyers, collectors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-audience-preset">Audience preset</Label>
              <select
                id="listing-ai-audience-preset"
                className="h-10 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-sm text-foreground"
                value={audiencePreset}
                onChange={(e) =>
                  setAudiencePreset(e.target.value as ListingAiAudiencePreset)
                }
              >
                <option value="collector">Collector</option>
                <option value="performance_buyer">Performance buyer</option>
                <option value="daily_driver">Daily driver buyer</option>
                <option value="project_car">Project-car buyer</option>
                <option value="weekend_enthusiast">Weekend enthusiast</option>
              </select>
              <p className="text-[11px] text-neutral-500">
                Audience emphasis comes from the current intake snapshot.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-ownership-duration">Ownership duration</Label>
              <Input
                id="listing-ai-ownership-duration"
                className="bg-black/30"
                value={ownershipDuration}
                onChange={(e) => setOwnershipDuration(e.target.value)}
                placeholder="e.g. 4 years"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-history-confidence">Service history confidence</Label>
              <select
                id="listing-ai-history-confidence"
                className="h-10 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-sm text-foreground"
                value={serviceHistoryConfidence}
                onChange={(e) =>
                  setServiceHistoryConfidence(
                    e.target.value as "documented" | "partial" | "unknown"
                  )
                }
              >
                <option value="documented">Documented</option>
                <option value="partial">Partial</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-docs">Documentation available</Label>
              <Input
                id="listing-ai-docs"
                className="bg-black/30"
                value={documentationAvailable}
                onChange={(e) => setDocumentationAvailable(e.target.value)}
                placeholder="Records, manuals, receipts…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-modifications">Modifications</Label>
              <Textarea
                id="listing-ai-modifications"
                rows={2}
                className="resize-y bg-black/30"
                value={modifications}
                onChange={(e) => setModifications(e.target.value)}
                placeholder="Major modifications, if any…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-ai-originality">Originality</Label>
              <Textarea
                id="listing-ai-originality"
                rows={2}
                className="resize-y bg-black/30"
                value={originality}
                onChange={(e) => setOriginality(e.target.value)}
                placeholder="Original paint, stock drivetrain, preserved details…"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="listing-ai-selling-reason">Selling reason</Label>
              <Input
                id="listing-ai-selling-reason"
                className="bg-black/30"
                value={sellingReason}
                onChange={(e) => setSellingReason(e.target.value)}
                placeholder="Why are you selling?"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="listing-ai-tone-scoped">Tone (optional)</Label>
            <Input
              id="listing-ai-tone-scoped"
              className="bg-black/30"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. transparent, matter-of-fact"
            />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {preview ? (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/25 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Preview
          </p>
          {scope === "full" ? (
            <>
              <div>
                <p className="text-xs text-neutral-500">Title</p>
                <p className="mt-0.5 font-medium text-foreground">{preview.title}</p>
              </div>
              {preview.titleOptions && preview.titleOptions.length > 0 ? (
                <div>
                  <p className="text-xs text-neutral-500">Title options</p>
                  <ul className="mt-1 space-y-1 text-neutral-300">
                    {preview.titleOptions.map((option) => (
                      <li key={option}>• {option}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {preview.shortSummary ? (
                <div>
                  <p className="text-xs text-neutral-500">Short summary</p>
                  <p className="mt-0.5 text-neutral-300">{preview.shortSummary}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-neutral-500">Description</p>
                <p className="mt-0.5 whitespace-pre-wrap text-neutral-300">{preview.description}</p>
              </div>
              {preview.conditionSummary ? (
                <div>
                  <p className="text-xs text-neutral-500">Condition summary</p>
                  <p className="mt-0.5 text-neutral-300">{preview.conditionSummary}</p>
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-500">Readiness</p>
                  <p className="mt-0.5 text-foreground">
                    {preview.readinessScore ?? 0}/100
                  </p>
                  {preview.readinessReasons?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-neutral-400">
                      {preview.readinessReasons.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div>
                  {preview.missingInfo?.length ? (
                    <>
                      <p className="text-xs text-neutral-500">Missing info</p>
                      <ul className="mt-2 space-y-1 text-xs text-neutral-400">
                        {preview.missingInfo.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {preview.riskFlags?.length ? (
                    <>
                      <p className="mt-3 text-xs text-neutral-500">Risk flags</p>
                      <ul className="mt-2 space-y-1 text-xs text-neutral-400">
                        {preview.riskFlags.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
              {preview.disclosureSuggestions?.length ? (
                <div>
                  <p className="text-xs text-neutral-500">Disclosure suggestions</p>
                  <ul className="mt-2 space-y-1 text-xs text-neutral-400">
                    {preview.disclosureSuggestions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
          {scope === "condition" ? (
            <div>
              <p className="text-xs text-neutral-500">Condition summary (will apply)</p>
              <p className="mt-0.5 whitespace-pre-wrap text-neutral-300">
                {preview.conditionSummary?.trim() || "—"}
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                Title and description are not changed when you apply from this step.
              </p>
            </div>
          ) : null}
          {scope === "imperfections" ? (
            <div>
              <p className="text-xs text-neutral-500">Description (will apply)</p>
              <p className="mt-0.5 whitespace-pre-wrap text-neutral-300">{preview.description}</p>
              <p className="mt-2 text-xs text-neutral-600">
                Title and condition summary are not changed when you apply from this block.
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" size="sm" variant="secondary" onClick={handleApply}>
              {applyLabel}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPreview(null)}>
              Discard preview
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
