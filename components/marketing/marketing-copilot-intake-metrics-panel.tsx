"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { MarketingCopilotIntakeMetricsSnapshot } from "@/lib/marketing/marketing-copilot-intake-metrics";

function formatUsd0(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function buildTimingHint(metrics: MarketingCopilotIntakeMetricsSnapshot): string {
  const status = metrics.listingStatus;
  const end = new Date(metrics.endAtIso).getTime();
  const now = Date.now();
  if (status === "LIVE" && end <= now) {
    return "Status is LIVE but the scheduled end is in the past — double-check the listing before using urgency language.";
  }
  if (status === "LIVE" && end > now) {
    const h = Math.round((end - now) / (1000 * 60 * 60));
    if (h <= 1) return "Auction ends very soon — prioritize clear CTAs and last-touch reminders.";
    if (h <= 36) return `Auction ends in about ${h} hours — tighten urgency without overpromising.`;
    const d = Math.round(h / 24);
    return `Auction ends in about ${d} day(s) — balance reach with a clear closing story.`;
  }
  if (status === "DRAFT") {
    return "Listing is still a draft — emphasize launch prep, channel sequencing, and proof points.";
  }
  if (status === "SOLD" || status === "CANCELLED" || status === "ENDED") {
    return `Listing status is ${status} — keep copy factual; focus on archive or learn angles if you are still promoting.`;
  }
  return "";
}

const cell =
  "rounded-2xl border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-3 py-3";

type Props = {
  metrics: MarketingCopilotIntakeMetricsSnapshot;
  urgency: string;
  onApplyTimingHint: (text: string) => void;
};

/**
 * Read-only traffic snapshot shown next to copilot intake so sellers align prompts with real signals.
 */
export function MarketingCopilotIntakeMetricsPanel({ metrics, urgency, onApplyTimingHint }: Props) {
  const timingHint = useMemo(() => buildTimingHint(metrics), [metrics]);

  return (
    <div className="rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-4 text-sm text-[hsl(var(--seller-foreground))]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--seller-muted))]">
            Traffic snapshot
          </p>
          <p className="mt-1 max-w-2xl text-xs text-[hsl(var(--seller-muted))]">
            Same totals as your overview above. The model also receives server-side bid count and 7-day
            view rollups — keep claims aligned with these numbers.
          </p>
        </div>
        {timingHint ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 border-[hsl(var(--seller-border))] bg-white text-xs text-[hsl(var(--seller-foreground))]"
            onClick={() => onApplyTimingHint(timingHint)}
          >
            {urgency.trim() ? "Replace urgency hint" : "Insert timing hint"}
          </Button>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Views (all)</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[hsl(var(--seller-foreground))]">{metrics.totalViews.toLocaleString()}</dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Share taps</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[hsl(var(--seller-foreground))]">
            {metrics.totalShareClicks.toLocaleString()}
          </dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Bid-button taps</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[hsl(var(--seller-foreground))]">
            {metrics.totalBidClicks.toLocaleString()}
          </dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Current high bid</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[hsl(var(--seller-foreground))]">{formatUsd0(metrics.highBidCents)}</dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Views (24h / 7d)</dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--seller-foreground))]">
            {metrics.viewsLast24h.toLocaleString()} / {metrics.viewsLast7d.toLocaleString()}
          </dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Bid taps (24h / 7d)</dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--seller-foreground))]">
            {metrics.bidClicksLast24h.toLocaleString()} / {metrics.bidClicksLast7d.toLocaleString()}
          </dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Status · ends</dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--seller-foreground))]">
            {metrics.listingStatus}
            <span className="block text-xs font-normal text-[hsl(var(--seller-muted))]">
              {formatShortDate(metrics.endAtIso)}
            </span>
          </dd>
        </div>
        <div className={cell}>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--seller-muted))]">Last activity</dt>
          <dd className="mt-0.5 font-semibold text-[hsl(var(--seller-foreground))]">{formatShortDate(metrics.lastActivityAtIso)}</dd>
        </div>
      </dl>
    </div>
  );
}
