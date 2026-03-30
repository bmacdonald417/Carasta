"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  createMarketingPreset,
  updateMarketingPreset,
} from "@/app/(app)/u/[handle]/marketing/presets/actions";
import type { MarketingPresetFormInput } from "@/lib/validations/marketing-preset";

type Source = MarketingPresetFormInput["source"];
type Medium = MarketingPresetFormInput["medium"];
type CopyV = MarketingPresetFormInput["copyVariant"];

function mediumForSource(s: Source): Medium {
  if (s === "email") return "email";
  if (s === "carmunity") return "community";
  return "social";
}

export function MarketingPresetForm({
  handle,
  mode,
  preset,
}: {
  handle: string;
  mode: "create" | "edit";
  preset?: {
    id: string;
    name: string;
    source: string;
    medium: string;
    campaignLabel: string | null;
    copyVariant: string;
    includeHashtags: boolean;
    includeKeywords: boolean;
    isDefault: boolean;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(preset?.name ?? "");
  const [source, setSource] = useState<Source>(
    (preset?.source as Source) ?? "instagram"
  );
  const [medium, setMedium] = useState<Medium>(
    (preset?.medium as Medium) ?? "social"
  );
  const [campaignLabel, setCampaignLabel] = useState(
    preset?.campaignLabel ?? ""
  );
  const [copyVariant, setCopyVariant] = useState<CopyV>(
    (preset?.copyVariant as CopyV) ?? "short"
  );
  const [includeHashtags, setIncludeHashtags] = useState(
    preset?.includeHashtags ?? true
  );
  const [includeKeywords, setIncludeKeywords] = useState(
    preset?.includeKeywords ?? true
  );
  const [isDefault, setIsDefault] = useState(preset?.isDefault ?? false);

  useEffect(() => {
    setMedium(mediumForSource(source));
  }, [source]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("source", source);
    fd.set("medium", medium);
    fd.set("campaignLabel", campaignLabel);
    fd.set("copyVariant", copyVariant);
    if (includeHashtags) fd.set("includeHashtags", "on");
    if (includeKeywords) fd.set("includeKeywords", "on");
    if (isDefault) fd.set("isDefault", "on");

    const result =
      mode === "create"
        ? await createMarketingPreset(handle, fd)
        : await updateMarketingPreset(handle, preset!.id, fd);

    setLoading(false);
    if (result.ok) {
      toast({ title: mode === "create" ? "Preset created" : "Preset updated" });
      router.push(`/u/${handle}/marketing/presets`);
      router.refresh();
    } else {
      toast({ title: result.error, variant: "destructive" });
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="mx-auto max-w-lg space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div>
        <Label htmlFor="mp-name" className="text-neutral-200">
          Name
        </Label>
        <Input
          id="mp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 border-white/10 bg-black/30"
          placeholder="e.g. Instagram spring push"
          required
        />
      </div>

      <div>
        <Label className="text-neutral-200">Primary channel (caption link)</Label>
        <Select
          value={source}
          onValueChange={(v) => setSource(v as Source)}
        >
          <SelectTrigger className="mt-2 border-white/10 bg-black/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="carmunity">Carmunity</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-neutral-500">
          Social captions use this channel&apos;s tracked URL; medium updates
          automatically.
        </p>
      </div>

      <div>
        <Label htmlFor="mp-campaign" className="text-neutral-200">
          UTM campaign label (optional)
        </Label>
        <Input
          id="mp-campaign"
          value={campaignLabel}
          onChange={(e) => setCampaignLabel(e.target.value)}
          className="mt-2 border-white/10 bg-black/30"
          placeholder={`Default: listing_…`}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Applied to all tracked links in the kit (Instagram, email, etc.) for
          consistent reporting.
        </p>
      </div>

      <div>
        <Label className="text-neutral-200">Preferred caption variant</Label>
        <Select
          value={copyVariant}
          onValueChange={(v) => setCopyVariant(v as CopyV)}
        >
          <SelectTrigger className="mt-2 border-white/10 bg-black/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short</SelectItem>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="ending_soon">Ending soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 text-sm text-neutral-300">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={includeHashtags}
            onChange={(e) => setIncludeHashtags(e.target.checked)}
            className="rounded border-white/20 bg-black/40"
          />
          Include hashtags block
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={includeKeywords}
            onChange={(e) => setIncludeKeywords(e.target.checked)}
            className="rounded border-white/20 bg-black/40"
          />
          Include keywords block
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-white/20 bg-black/40"
          />
          Use as default preset on listing marketing pages
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="performance" disabled={loading}>
          {loading ? "Saving…" : mode === "create" ? "Create preset" : "Save"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/u/${handle}/marketing/presets`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
