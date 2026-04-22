import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";

export type SellerTone = "neutral" | "info" | "success" | "caution" | "urgency";

const toneMap: Record<
  SellerTone,
  {
    badge: string;
    iconWrap: string;
    panelBorder: string;
  }
> = {
  neutral: {
    badge: "border-border bg-muted/60 text-foreground",
    iconWrap: "bg-muted text-foreground",
    panelBorder: "border-border",
  },
  info: {
    badge:
      "border-[hsl(var(--seller-info))]/15 bg-[hsl(var(--seller-info-soft))] text-[hsl(var(--seller-info-foreground))]",
    iconWrap:
      "bg-[hsl(var(--seller-info-soft))] text-[hsl(var(--seller-info-foreground))]",
    panelBorder: "border-[hsl(var(--seller-info))]/20",
  },
  success: {
    badge:
      "border-[hsl(var(--seller-success))]/15 bg-[hsl(var(--seller-success-soft))] text-[hsl(var(--seller-success-foreground))]",
    iconWrap:
      "bg-[hsl(var(--seller-success-soft))] text-[hsl(var(--seller-success-foreground))]",
    panelBorder: "border-[hsl(var(--seller-success))]/18",
  },
  caution: {
    badge:
      "border-[hsl(var(--seller-caution))]/15 bg-[hsl(var(--seller-caution-soft))] text-[hsl(var(--seller-caution-foreground))]",
    iconWrap:
      "bg-[hsl(var(--seller-caution-soft))] text-[hsl(var(--seller-caution-foreground))]",
    panelBorder: "border-[hsl(var(--seller-caution))]/18",
  },
  urgency: {
    badge:
      "border-[hsl(var(--seller-urgency))]/15 bg-[hsl(var(--seller-urgency-soft))] text-[hsl(var(--seller-urgency-foreground))]",
    iconWrap:
      "bg-[hsl(var(--seller-urgency-soft))] text-[hsl(var(--seller-urgency-foreground))]",
    panelBorder: "border-[hsl(var(--seller-urgency))]/18",
  },
};

export function SellerWorkspaceShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`seller-workspace-shell min-h-full ${className}`}>
      <div className="seller-grid min-h-full">{children}</div>
    </div>
  );
}

export function SellerStatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: SellerTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneMap[tone].badge}`}
    >
      {label}
    </span>
  );
}

export function SellerSectionPanel({
  title,
  description,
  actions,
  children,
  tone = "neutral",
  id,
  className = "",
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  tone?: SellerTone;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-2xl border bg-card p-6 shadow-e1 md:p-7 ${toneMap[tone].panelBorder} ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--seller-foreground))] md:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--seller-muted))]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SellerKpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: SellerTone;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-e1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[hsl(var(--seller-muted))]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[hsl(var(--seller-foreground))]">
            {value}
          </p>
          {detail ? (
            <p className="mt-3 text-xs leading-5 text-[hsl(var(--seller-muted))]">
              {detail}
            </p>
          ) : null}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneMap[tone].iconWrap}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function SellerInsightCard({
  title,
  body,
  tone = "info",
  ctaLabel,
  ctaHref,
  icon: Icon,
}: {
  title: string;
  body: string;
  tone?: SellerTone;
  ctaLabel?: string;
  ctaHref?: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 shadow-e1 ${toneMap[tone].panelBorder}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneMap[tone].iconWrap}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <SellerStatusBadge
            label={
              tone === "info"
                ? "Insight"
                : tone === "success"
                  ? "Healthy"
                  : tone === "caution"
                    ? "Watch"
                    : tone === "urgency"
                      ? "Urgent"
                      : "Status"
            }
            tone={tone}
          />
          <h3 className="mt-3 text-lg font-semibold text-[hsl(var(--seller-foreground))]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--seller-muted))]">
            {body}
          </p>
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SellerMicroBar({
  value,
  max,
  tone = "info",
}: {
  value: number;
  max: number;
  tone?: SellerTone;
}) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  const fill =
    tone === "success"
      ? "bg-[hsl(var(--seller-success))]"
      : tone === "caution"
        ? "bg-[hsl(var(--seller-caution))]"
        : tone === "urgency"
          ? "bg-[hsl(var(--seller-urgency))]"
          : "bg-[hsl(var(--seller-info))]";

  return (
    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-[width] ${fill}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
