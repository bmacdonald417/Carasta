"use client";

import { useCallback, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
};

type Props = {
  enabled: boolean;
  /** When refining server-backed draft/live listing. */
  auctionId?: string | null;
  intake: ListingAiIntakeSnapshot;
  onApply: (patch: {
    title: string;
    description: string;
    conditionSummary: string;
  }) => void;
};

export function ListingAiAssistant({ enabled, auctionId, intake, onApply }: Props) {
  const [highlights, setHighlights] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    conditionSummary?: string;
  } | null>(null);

  const buildBody = useCallback(() => {
    const mileage =
      intake.mileage === "" ? undefined : Number(intake.mileage);
    return {
      ...(auctionId ? { auctionId } : {}),
      year: intake.year,
      make: intake.make.trim() || "TBD",
      model: intake.model.trim() || "TBD",
      trim: intake.trim.trim() || undefined,
      mileage: Number.isFinite(mileage as number) ? (mileage as number) : undefined,
      vin: intake.vin.trim() || undefined,
      title: intake.title.trim() || undefined,
      description: intake.description.trim() || undefined,
      conditionSummary: intake.conditionSummary.trim() || undefined,
      highlights: highlights.trim() || undefined,
      tone: tone.trim() || undefined,
      audience: audience.trim() || undefined,
    };
  }, [auctionId, audience, highlights, intake, tone]);

  const generate = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/listings/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const j = (await res.json()) as {
        listing?: { title: string; description: string; conditionSummary?: string };
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
  }, [buildBody]);

  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-[#ff3b5c]/25 bg-gradient-to-b from-[#ff3b5c]/[0.07] to-transparent p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#ff3b5c]">
            <Sparkles className="h-5 w-5 shrink-0" />
            <h3 className="font-display text-base font-semibold text-neutral-100">
              AI listing assistant
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Draft title, description, and condition summary from your basics. Review before
            applying — nothing publishes until you submit the listing.
          </p>
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
            "Generate draft"
          )}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
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
          <div>
            <p className="text-xs text-neutral-500">Title</p>
            <p className="mt-0.5 font-medium text-neutral-100">{preview.title}</p>
          </div>
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
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                onApply({
                  title: preview.title,
                  description: preview.description,
                  conditionSummary: preview.conditionSummary ?? "",
                })
              }
            >
              Apply to form
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
