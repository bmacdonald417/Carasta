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
import { useEffect, useState } from "react";
import { SellerSectionPanel } from "@/components/marketing/seller-workspace-primitives";

export type { MarketingLinkRowDef };

export type SharePromotePresetBundle = {
  id: string;
  name: string;
  isDefault: boolean;
  linkRows: MarketingLinkRowDef[];
  copyPack: SellerShareCopyPack;
  copyVariant: "short" | "long" | "ending_soon";
};

function resolveInitialSelection(
  initialFromUrl: "built_in" | string | null | undefined,
  presetBundles: SharePromotePresetBundle[]
): "built_in" | string {
  if (initialFromUrl === "built_in") return "built_in";
  if (
    initialFromUrl &&
    presetBundles.some((p) => p.id === initialFromUrl)
  ) {
    return initialFromUrl;
  }
  const d = presetBundles.find((p) => p.isDefault);
  return d?.id ?? presetBundles[0]?.id ?? "built_in";
}

export function ShareAndPromotePanel({
  defaultBundle,
  presetBundles,
  managePresetsHref,
  /** From `?presetId=` when valid (`built_in` or a saved preset id). */
  initialSharePresetSelection = null,
}: {
  defaultBundle: {
    linkRows: MarketingLinkRowDef[];
    copyPack: SellerShareCopyPack;
  };
  presetBundles: SharePromotePresetBundle[];
  managePresetsHref: string;
  initialSharePresetSelection?: "built_in" | string | null;
}) {
  const [selection, setSelection] = useState<"built_in" | string>(() =>
    resolveInitialSelection(initialSharePresetSelection, presetBundles)
  );

  useEffect(() => {
    if (initialSharePresetSelection == null) return;
    setSelection(resolveInitialSelection(initialSharePresetSelection, presetBundles));
  }, [initialSharePresetSelection, presetBundles]);

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
    <SellerSectionPanel
      title="Share & Promote"
      description="Tracked links include UTM parameters so visits can appear in your traffic breakdown. Saved presets reuse your campaign label and copy preferences while keeping execution manual."
      tone="info"
      actions={
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={managePresetsHref}>Manage Presets</Link>
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-3 rounded-[1.25rem] border border-[hsl(var(--seller-info))]/15 bg-[hsl(var(--seller-info-soft))] px-4 py-3 text-[hsl(var(--seller-info-foreground))]">
        <div className="rounded-xl bg-white/75 p-2">
          <Megaphone className="h-6 w-6" />
        </div>
        <p className="text-sm">
          Use this as the listing&apos;s manual distribution kit: tracked links,
          reusable captions, and copy variants that support faster execution.
        </p>
      </div>

      <p className="max-w-3xl text-xs text-[hsl(var(--seller-muted))]">
        Deep link: append{" "}
        <code className="rounded bg-white px-1 text-[11px] text-[hsl(var(--seller-foreground))]">?presetId=…</code>{" "}
        to this page&apos;s URL (use a preset id from Manage Presets, or{" "}
        <code className="rounded bg-white px-1 text-[11px] text-[hsl(var(--seller-foreground))]">built_in</code> for
        the standard bundle) to open Share &amp; Promote with that selection.
      </p>

      {hasPresets ? (
        <div className="mt-6 max-w-md">
          <Label className="text-[hsl(var(--seller-foreground))]">Apply preset</Label>
          <Select
            value={selection}
            onValueChange={(v) => setSelection(v as "built_in" | string)}
          >
            <SelectTrigger className="mt-2 border-[hsl(var(--seller-border))] bg-white text-[hsl(var(--seller-foreground))]">
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
            <p className="mt-2 text-xs text-[hsl(var(--seller-muted))]">
              Highlighted caption matches your preset&apos;s preferred variant (
              {highlightVariant.replace("_", " ")}).
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-foreground))]">
            Link kit
          </h3>
          <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">
            Copy and paste into bios, stories, DMs, or newsletters.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {linkRows.map((row) => (
              <MarketingLinkCopyRow key={row.label} label={row.label} url={row.url} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-foreground))]">
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
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-foreground))]">
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
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-foreground))]">
            Hashtags &amp; keywords
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-[hsl(var(--seller-foreground))]">Hashtags</h4>
                  <p className="mt-0.5 text-xs text-[hsl(var(--seller-muted))]">
                    Suggested tags — edit to fit your audience.
                  </p>
                </div>
                {copyPack.hashtagsLine ? (
                  <MarketingCopyButton text={copyPack.hashtagsLine} label="Hashtags" />
                ) : null}
              </div>
              <p className="mt-3 text-sm text-[hsl(var(--seller-foreground))]">
                {copyPack.hashtagsLine || (
                  <span className="text-[hsl(var(--seller-muted))]">Not included for this preset.</span>
                )}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-[hsl(var(--seller-foreground))]">Keywords</h4>
                  <p className="mt-0.5 text-xs text-[hsl(var(--seller-muted))]">
                    For search or listing descriptions elsewhere.
                  </p>
                </div>
                {copyPack.keywordsLine ? (
                  <MarketingCopyButton text={copyPack.keywordsLine} label="Keywords" />
                ) : null}
              </div>
              <p className="mt-3 text-sm text-[hsl(var(--seller-foreground))]">
                {copyPack.keywordsLine || (
                  <span className="text-[hsl(var(--seller-muted))]">Not included for this preset.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SellerSectionPanel>
  );
}
