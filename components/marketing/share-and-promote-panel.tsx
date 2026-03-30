"use client";

import type { SellerShareCopyPack } from "@/lib/marketing/generate-share-copy";
import { MarketingLinkCopyRow } from "@/components/marketing/marketing-link-copy-row";
import { MarketingTextCopyBlock } from "@/components/marketing/marketing-text-copy-block";
import { MarketingCopyButton } from "@/components/marketing/marketing-copy-button";
import { Megaphone } from "lucide-react";

export type MarketingLinkRowDef = { label: string; url: string };

export function ShareAndPromotePanel({
  linkRows,
  copyPack,
}: {
  linkRows: MarketingLinkRowDef[];
  copyPack: SellerShareCopyPack;
}) {
  return (
    <section className="rounded-2xl border border-[#ff3b5c]/20 bg-gradient-to-b from-[#ff3b5c]/5 to-transparent p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#ff3b5c]/20 p-2">
          <Megaphone className="h-6 w-6 text-[#ff3b5c]" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-neutral-100">
            Share &amp; Promote
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-neutral-400">
            Tracked links include UTM parameters so visits can appear in your
            traffic breakdown. Use the channel-specific link when you post to
            that platform (Instagram, email, etc.).
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Link kit
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Copy and paste into bios, stories, DMs, or newsletters.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {linkRows.map((row) => (
              <MarketingLinkCopyRow key={row.label} label={row.label} url={row.url} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Social captions
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <MarketingTextCopyBlock
              title="Short caption"
              description="Quick post or story text."
              body={copyPack.shortCaption}
              copyLabel="Short caption"
            />
            <MarketingTextCopyBlock
              title="Long caption"
              description="More context for feeds or car clubs."
              body={copyPack.longCaption}
              copyLabel="Long caption"
            />
            <MarketingTextCopyBlock
              title="Ending soon"
              description="Use when you’re in the final stretch."
              body={copyPack.endingSoonCaption}
              copyLabel="Ending soon caption"
            />
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Email snippet
          </h3>
          <div className="mt-4 grid gap-4">
            <MarketingTextCopyBlock
              title="Subject line"
              body={copyPack.emailSubject}
              copyLabel="Email subject"
            />
            <MarketingTextCopyBlock
              title="Body"
              description="Plain text — paste into your mail client."
              body={copyPack.emailBody}
              copyLabel="Email body"
            />
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Hashtags &amp; keywords
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-neutral-200">Hashtags</h4>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Suggested tags — edit to fit your audience.
                  </p>
                </div>
                <MarketingCopyButton text={copyPack.hashtagsLine} label="Hashtags" />
              </div>
              <p className="mt-3 text-sm text-neutral-300">{copyPack.hashtagsLine}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-neutral-200">Keywords</h4>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    For search or listing descriptions elsewhere.
                  </p>
                </div>
                <MarketingCopyButton text={copyPack.keywordsLine} label="Keywords" />
              </div>
              <p className="mt-3 text-sm text-neutral-300">{copyPack.keywordsLine}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
