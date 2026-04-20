"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Cursor = { createdAt: string; id: string } | null;

type TxnRow = {
  id: string;
  kind: string;
  status: string;
  amount: number;
  currency: string;
  reasonCode: string | null;
  description: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export function WalletHistoryClient() {
  const [items, setItems] = useState<TxnRow[]>([]);
  const [nextCursor, setNextCursor] = useState<Cursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(initial = false) {
    if (initial) setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ take: "25" });
      if (!initial && nextCursor) {
        qs.set("cursorCreatedAt", nextCursor.createdAt);
        qs.set("cursorId", nextCursor.id);
      }
      const res = await fetch(`/api/rewards/wallet/history?${qs.toString()}`);
      const j = (await res.json()) as {
        ok?: boolean;
        items?: TxnRow[];
        nextCursor?: Cursor;
        error?: string;
      };
      if (!res.ok || !j.ok) throw new Error(j.error ?? "Failed to load history.");
      const incoming = j.items ?? [];
      setItems((prev) => (initial ? incoming : [...prev, ...incoming]));
      setNextCursor(j.nextCursor ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-neutral-300">{error}</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void load(true)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      {items.length === 0 ? (
        <div className="p-6 text-sm text-neutral-500">No transactions yet.</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map((t) => (
            <li key={t.id} className="px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-neutral-200">
                    {t.description ?? t.reasonCode ?? t.kind}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    {new Date(t.createdAt).toLocaleString()} · {t.kind} · {t.status}
                    {t.expiresAt ? ` · expires ${new Date(t.expiresAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <p className={`shrink-0 font-mono ${t.amount >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {t.amount}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {nextCursor ? (
        <div className="border-t border-white/10 p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={loadingMore}
            onClick={() => {
              setLoadingMore(true);
              void load(false);
            }}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

