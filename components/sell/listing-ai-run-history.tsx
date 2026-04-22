"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type RunRow = {
  id: string;
  createdAt: string;
  model: string;
  kind: string;
  field: string | null;
  preview: string;
  intakeSummary: string | null;
};

export function ListingAiRunHistory({
  auctionId,
  active,
  refreshKey,
}: {
  auctionId: string;
  /** When false, skip network (dialog closed). */
  active: boolean;
  /** Bump to force refetch (e.g. dialog reopened). */
  refreshKey: number;
}) {
  const [runs, setRuns] = useState<RunRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!active || !auctionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/listings/ai/runs?auctionId=${encodeURIComponent(auctionId)}&limit=20`
      );
      const j = (await res.json()) as { runs?: RunRow[]; message?: string };
      if (!res.ok) throw new Error(j.message ?? "Could not load history.");
      setRuns(Array.isArray(j.runs) ? j.runs : []);
    } catch (e) {
      setRuns(null);
      setError(e instanceof Error ? e.message : "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [active, auctionId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!active) return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
          <History className="h-4 w-4 text-primary/80" />
          Recent AI activity
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-neutral-400 hover:text-foreground"
          disabled={loading}
          onClick={() => void load()}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Auditable runs for this listing. Previews are truncated; full prompts are not shown.
      </p>

      {error ? (
        <p className="mt-3 text-sm text-red-300">{error}</p>
      ) : null}

      {!error && runs && runs.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No listing AI runs yet for this auction.</p>
      ) : null}

      {!error && runs && runs.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {runs.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-neutral-300"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs text-neutral-500">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500">
                  {r.kind}
                  {r.field ? ` · ${r.field}` : ""} · {r.model}
                </span>
              </div>
              {r.intakeSummary ? (
                <p className="mt-1 text-xs text-neutral-600">{r.intakeSummary}</p>
              ) : null}
              {r.preview ? (
                <details className="mt-2 group">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-primary hover:text-primary/90">
                    <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
                    Output preview
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-black/40 p-2 text-xs text-neutral-400">
                    {r.preview}
                  </pre>
                </details>
              ) : (
                <p className="mt-1 text-xs text-neutral-600">No preview text stored.</p>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {loading && !runs ? (
        <p className="mt-3 text-sm text-neutral-500">Loading…</p>
      ) : null}
    </div>
  );
}
