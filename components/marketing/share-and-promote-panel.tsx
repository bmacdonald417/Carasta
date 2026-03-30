"use client";

import type { SellerShareCopyPack } from "@/lib/marketing/generate-share-copy";
import type { MarketingLinkRowDef } from "@/lib/marketing/share-promote-types";
import { MarketingLinkCopyRow } from "@/components/marketing/marketing-link-copy-row";
import { MarketingTextCopyBlock } from "@/components/marketing/marketing-text-copy-block";
import { MarketingCopyButton } from "@/components/marketing/marketing-copy-button";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";

export type { MarketingLinkRowDef };

export type SharePromotePresetBundle = {
  id: string;
  name: string;
  isDefault: boolean;
  linkRows: MarketingLinkRowDef[];
  copyPack: SellerShareCopyPack;
  copyVariant: "short" | "long" | "ending_soon";
};

export function ShareAndPromotePanel({
  defaultBundle,
  presetBundles,
  managePresetsHref,
}: {
  defaultBundle: {
    linkRows: MarketingLinkRowDef[];
    copyPack: SellerShareCopyPack;
  };
  presetBundles: SharePromotePresetBundle[];
  managePresetsHref: string;
}) {
  const initialPresetId = useMemo(() => {
    const d = presetBundles.find((p) => p.isDefault);
    return d?.id ?? presetBundles[0]?.id ?? null;
  }, [presetBundles]);

  const [selection, setSelection] = useState<"built_in" | string>(() =>
    initialPresetId ? initialPresetId : "built_in"
  );

  const active =
    selection === "built_in"
      ? defaultBundle
      : presetBundles.find((p) => p.id === selection) ?? defaultBundle;

  const highlightVariant =
    selection === "built_in"
      ? null
      : presetBundles.find((p) => p.id === selection)?.copyVariant ?? null;

  const hasPresets = presetBundles.length > 0;
  const copyPack = active.copyPack;
  const linkRows = active.linkRows;

  return (
    <section className="rounded-2xl border border-[#ff3b5c]/20 bg-gradient-to-b from-[#ff3b5c]/5 to-transparent p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
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
              traffic breakdown. Saved presets reuse your campaign label and copy
              preferences — everything stays manual.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={managePresetsHref}>Manage Presets</Link>
        </Button>
      </div>

      {hasPresets ? (
        <div className="mt-6 max-w-md">
          <Label className="text-neutral-300">Apply preset</Label>
          <Select
            value={selection}
            onValueChange={(v) => setSelection(v as "built_in" | string)}
          >
            <SelectTrigger className="mt-2 border-white/10 bg-black/30 text-neutral-100">
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="built_in">Standard (default UTM campaign)</SelectItem>
              {presetBundles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  {p.isDefault ? " · default" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selection !== "built_in" && highlightVariant ? (
            <p className="mt-2 text-xs text-neutral-500">
              Highlighted caption matches your preset&apos;s preferred variant (
              {highlightVariant.replace("_", " ")}).
            </p>
          ) : null}
        </div>
      ) : null}

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
              highlight={highlightVariant === "short"}
            />
            <MarketingTextCopyBlock
              title="Long caption"
              description="More context for feeds or car clubs."
              body={copyPack.longCaption}
              copyLabel="Long caption"
              highlight={highlightVariant === "long"}
            />
            <MarketingTextCopyBlock
              title="Ending soon"
              description="Use when you’re in the final stretch."
              body={copyPack.endingSoonCaption}
              copyLabel="Ending soon caption"
              highlight={highlightVariant === "ending_soon"}
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
                {copyPack.hashtagsLine ? (
                  <MarketingCopyButton text={copyPack.hashtagsLine} label="Hashtags" />
                ) : null}
              </div>
              <p className="mt-3 text-sm text-neutral-300">
                {copyPack.hashtagsLine || (
                  <span className="text-neutral-500">Not included for this preset.</span>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-neutral-200">Keywords</h4>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    For search or listing descriptions elsewhere.
                  </p>
                </div>
                {copyPack.keywordsLine ? (
                  <MarketingCopyButton text={copyPack.keywordsLine} label="Keywords" />
                ) : null}
              </div>
              <p className="mt-3 text-sm text-neutral-300">
                {copyPack.keywordsLine || (
                  <span className="text-neutral-500">Not included for this preset.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
