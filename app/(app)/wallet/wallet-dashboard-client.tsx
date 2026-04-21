"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type WalletSummary = {
  walletId: string;
  userId: string;
  balanceAvailable: number;
  balancePending: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
};

type TxnRow = {
  id: string;
  kind: string;
  status: string;
  amount: number;
  currency: string;
  reasonCode: string | null;
  description: string | null;
  createdAt: string;
};

export function WalletDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [history, setHistory] = useState<TxnRow[]>([]);

  const headline = useMemo(() => {
    if (!summary) return null;
    return {
      available: summary.balanceAvailable,
      pending: summary.balancePending,
      earned: summary.lifetimeEarned,
      spent: summary.lifetimeSpent,
    };
  }, [summary]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [sRes, hRes] = await Promise.all([
        fetch("/api/rewards/wallet/summary"),
        fetch("/api/rewards/wallet/history?take=10"),
      ]);
      const sj = (await sRes.json()) as { ok?: boolean; summary?: WalletSummary; error?: string };
      const hj = (await hRes.json()) as { ok?: boolean; items?: TxnRow[]; error?: string };
      if (!sRes.ok || !sj.ok || !sj.summary) throw new Error(sj.error ?? "Failed to load wallet.");
      if (!hRes.ok || !hj.ok) throw new Error(hj.error ?? "Failed to load history.");
      setSummary(sj.summary);
      setHistory(hj.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load wallet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
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
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Available balance
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">
            {headline?.available ?? 0}
          </p>
          <p className="mt-1 text-xs text-neutral-500">Carasta Coin</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Pending / held
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">
            {headline?.pending ?? 0}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            High-value rewards may release after verification windows.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Recent activity</p>
            <p className="mt-1 text-xs text-neutral-500">
              Every movement is recorded as an immutable ledger entry.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="border-primary/35 text-primary hover:bg-primary/10">
            <Link href="/wallet/history">View all</Link>
          </Button>
        </div>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No transactions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {history.map((t) => (
              <li key={t.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-neutral-200">
                    {t.description ?? t.reasonCode ?? t.kind}
                  </p>
                  <p className={`shrink-0 font-mono ${t.amount >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {t.amount}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {new Date(t.createdAt).toLocaleString()} · {t.kind}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-foreground">Referral center</p>
        <p className="mt-1 text-xs text-neutral-500">
          Phase 1 includes the backend foundations; UI will show your share link and pipeline next.
        </p>
      </div>
    </div>
  );
}

