"use client";

import { MarketingCopyButton } from "@/components/marketing/marketing-copy-button";

export function MarketingLinkCopyRow({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className="shrink-0 pt-2 text-sm font-medium text-neutral-400 sm:w-36">
        {label}
      </div>
      <div className="flex min-w-0 flex-1 gap-2">
        <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 font-mono text-xs leading-relaxed text-neutral-300 break-all">
          {url}
        </div>
        <MarketingCopyButton text={url} label={label} className="shrink-0 self-start" />
      </div>
    </div>
  );
}
