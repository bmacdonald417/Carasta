"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type RunRow = {
  id: string;
  createdAt: string;
  model: string;
  kind: string;
  applied: boolean;
  preview: string;
  intakeSummary: string | null;
};

/**
 * Auditable marketing copilot runs for one auction (read-only, truncated previews).
 */
export function MarketingCopilotRunHistory({
  auctionId,
  enabled,
  refreshKey,
}: {
  auctionId: string;
  /** When false, skip fetch (e.g. marketing off or unauthenticated). */
  enabled: boolean;
  /** Bump after generate / apply / regen to refetch. */
  refreshKey: number;
}) {
  const [runs, setRuns] = useState<RunRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !auctionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/marketing/copilot/runs?auctionId=${encodeURIComponent(auctionId)}&limit=25`
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
  }, [enabled, auctionId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!enabled) return null;

  return (
    <div className="mt-8 rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--seller-foreground))]">
          <History className="h-4 w-4 text-[hsl(var(--seller-info))]" />
          Copilot run history
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-[hsl(var(--seller-muted))] hover:text-[hsl(var(--seller-foreground))]"
          disabled={loading}
          onClick={() => void load()}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">
        Full prompts are not shown. &quot;Applied&quot; means this run was saved into your workspace via
        Apply.
      </p>

      {error ? <p className="mt-3 text-sm text-[hsl(var(--seller-urgency-foreground))]">{error}</p> : null}

      {!error && runs && runs.length === 0 ? (
        <p className="mt-4 text-sm text-[hsl(var(--seller-muted))]">No copilot runs yet for this listing.</p>
      ) : null}

      {!error && runs && runs.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {runs.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[hsl(var(--seller-border))] bg-white px-3 py-2 text-sm text-[hsl(var(--seller-foreground))]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs text-[hsl(var(--seller-muted))]">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
                <span className="text-xs text-[hsl(var(--seller-muted))]">
                  {r.kind} · {r.model}
                  {r.applied ? (
                    <span className="ml-2 rounded bg-[hsl(var(--seller-success-soft))] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--seller-success-foreground))]">
                      Applied
                    </span>
                  ) : null}
                </span>
              </div>
              {r.intakeSummary ? (
                <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">{r.intakeSummary}</p>
              ) : null}
              {r.preview ? (
                <details className="mt-2 group">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-[hsl(var(--seller-info-foreground))] hover:opacity-85">
                    <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
                    Output preview
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-2 text-xs text-[hsl(var(--seller-muted))]">
                    {r.preview}
                  </pre>
                </details>
              ) : (
                <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">No preview text stored.</p>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
