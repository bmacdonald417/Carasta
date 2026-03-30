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
      className={`rounded-xl border border-white/10 bg-black/20 p-4 ${
        highlight ? "ring-2 ring-[#ff3b5c]/50 ring-offset-2 ring-offset-[#0a0a0f]" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-neutral-200">{title}</h4>
          {description ? (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          ) : null}
        </div>
        <MarketingCopyButton text={body} label={copyLabel} />
      </div>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/5 bg-[#0a0a0f]/80 px-3 py-2 font-sans text-sm text-neutral-300">
        {body}
      </pre>
    </div>
  );
}
