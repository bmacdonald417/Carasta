"use client";

import { MarketingCopyButton } from "@/components/marketing/marketing-copy-button";

export function MarketingTextCopyBlock({
  title,
  description,
  body,
  copyLabel,
  highlight,
}: {
  title: string;
  description?: string;
  body: string;
  copyLabel: string;
  /** Emphasize block when a saved preset names this copy variant. */
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-white p-4 ${
        highlight ? "ring-2 ring-[hsl(var(--seller-info))]/35 ring-offset-2 ring-offset-[hsl(var(--seller-canvas))]" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-[hsl(var(--seller-foreground))]">{title}</h4>
          {description ? (
            <p className="mt-0.5 text-xs text-[hsl(var(--seller-muted))]">{description}</p>
          ) : null}
        </div>
        <MarketingCopyButton text={body} label={copyLabel} />
      </div>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-3 py-2 font-sans text-sm text-[hsl(var(--seller-foreground))]">
        {body}
      </pre>
    </div>
  );
}
