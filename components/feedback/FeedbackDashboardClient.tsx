"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import IncorporateFeedbackPanel from "./IncorporateFeedbackPanel";
import type { FeedbackStatus } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink } from "lucide-react";

export type FeedbackRowVM = {
  id: string;
  content: string;
  category: string;
  pageUrl: string | null;
  elementSelector: string | null;
  elementText: string | null;
  elementType: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionCommitSha: string | null;
  resolutionCommitUrl: string | null;
  resolutionSummary: string | null;
  resolutionFiles: unknown;
};

type Props = {
  initialRows: FeedbackRowVM[];
};

export default function FeedbackDashboardClient({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const counts = useMemo(() => {
    const base = { all: rows.length, pending: 0, reviewed: 0, resolved: 0 };
    for (const r of rows) {
      if (r.status === "pending") base.pending += 1;
      if (r.status === "reviewed") base.reviewed += 1;
      if (r.status === "resolved") base.resolved += 1;
    }
    return base;
  }, [rows]);

  async function patchStatus(id: string, status: FeedbackStatus) {
    if (loadingIds.has(id)) return;
    setLoadingIds((prev) => new Set(prev).add(id));
    const prev = rows.find((r) => r.id === id);
    setRows((all) =>
      all.map((r) =>
        r.id === id
          ? { ...r, status, resolvedAt: status === "resolved" ? new Date().toISOString() : r.resolvedAt }
          : r
      )
    );
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string };
        throw new Error(j?.error ?? `Update failed (${res.status})`);
      }
    } catch (e) {
      if (prev) {
        setRows((all) => all.map((r) => (r.id === id ? prev : r)));
      }
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Could not update status.",
        variant: "destructive",
      });
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function filterRows(tab: FeedbackStatus | "all") {
    if (tab === "all") return rows;
    return rows.filter((r) => r.status === tab);
  }

  return (
    <div className="carasta-container space-y-8 py-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Admin
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-wide text-neutral-100">
          Element feedback
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500">
          Submissions from the floating widget (signed-in users). Resolve items
          here and attach commit provenance when fixes land.
        </p>
      </header>

      <IncorporateFeedbackPanel />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-white/5 p-1">
          <TabsTrigger value="all" className="rounded-xl">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="rounded-xl">
            Reviewed ({counts.reviewed})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="rounded-xl">
            Resolved ({counts.resolved})
          </TabsTrigger>
        </TabsList>

        {(["all", "pending", "reviewed", "resolved"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
            {filterRows(tab).length === 0 ? (
              <p className="text-sm text-neutral-500">No items.</p>
            ) : (
              filterRows(tab).map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-primary">
                          {r.category}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-neutral-400">
                          {r.status}
                        </span>
                        <span className="text-xs text-neutral-600">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-200">{r.content}</p>
                      {r.pageUrl ? (
                        <a
                          href={r.pageUrl}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {r.pageUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                      {r.elementSelector ? (
                        <p className="font-mono text-[11px] text-neutral-500">
                          {r.elementType}: {r.elementSelector}
                        </p>
                      ) : null}
                      {r.elementText ? (
                        <p className="text-xs text-neutral-500 line-clamp-3">
                          {r.elementText}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {r.status !== "reviewed" && r.status !== "resolved" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-2xl border-white/15"
                          disabled={loadingIds.has(r.id)}
                          onClick={() => void patchStatus(r.id, "reviewed")}
                        >
                          {loadingIds.has(r.id) ? "Saving…" : "Mark reviewed"}
                        </Button>
                      ) : null}
                      {r.status !== "resolved" ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-2xl"
                          disabled={loadingIds.has(r.id)}
                          onClick={() => void patchStatus(r.id, "resolved")}
                        >
                          {loadingIds.has(r.id) ? "Saving…" : "Mark resolved"}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {r.status === "resolved" &&
                  (r.resolutionCommitSha ||
                    r.resolutionSummary ||
                    r.resolutionFiles) ? (
                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-50/90">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/80">
                        Resolution
                      </p>
                      {r.resolutionCommitUrl && r.resolutionCommitSha ? (
                        <a
                          href={r.resolutionCommitUrl}
                          className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-emerald-200 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {r.resolutionCommitSha.slice(0, 12)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : r.resolutionCommitSha ? (
                        <p className="mt-2 font-mono text-xs">
                          {r.resolutionCommitSha}
                        </p>
                      ) : null}
                      {r.resolutionSummary ? (
                        <p className="mt-2 text-neutral-200">
                          {r.resolutionSummary}
                        </p>
                      ) : null}
                      {r.resolutionFiles != null ? (
                        <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-black/40 p-3 text-[11px] text-neutral-300">
                          {JSON.stringify(r.resolutionFiles, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
