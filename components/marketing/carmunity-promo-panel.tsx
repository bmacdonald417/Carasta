"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CarmunityPostPreview } from "@/components/marketing/carmunity-post-preview";
import { publishCarmunityPromoPost } from "@/app/(app)/u/[handle]/marketing/auctions/carmunity-promo-actions";
import {
  CARMUNITY_PROMO_TEMPLATES,
  type CarmunityDraftPack,
  type CarmunityPromoTemplate,
} from "@/lib/marketing/generate-carmunity-draft";

export function CarmunityPromoPanel({
  handle,
  auctionId,
  draft,
  displayName,
  avatarUrl,
}: {
  handle: string;
  auctionId: string;
  draft: CarmunityDraftPack;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const { toast } = useToast();
  const [template, setTemplate] = useState<CarmunityPromoTemplate>(
    draft.defaultTemplate
  );
  const [content, setContent] = useState(
    () => draft.templates[draft.defaultTemplate].body
  );
  const [includeImage, setIncludeImage] = useState(!!draft.primaryImageUrl);
  const [publishing, setPublishing] = useState(false);

  function applyTemplate(next: CarmunityPromoTemplate) {
    setTemplate(next);
    setContent(draft.templates[next].body);
  }

  async function onPublish() {
    const canPublish =
      !!content.trim() ||
      (!!draft.primaryImageUrl && includeImage);
    if (!canPublish) {
      toast({
        title: "Add content",
        description: "Write a caption or turn on the listing photo.",
        variant: "destructive",
      });
      return;
    }
    setPublishing(true);
    const result = await publishCarmunityPromoPost({
      handle,
      auctionId,
      content,
      includeAuctionImage: includeImage && !!draft.primaryImageUrl,
    });
    setPublishing(false);
    if (result.ok) {
      toast({
        title: "Posted to Carmunity",
        description: "Your promo is live on the community feed.",
      });
      return;
    }
    toast({
      title: result.error,
      variant: "destructive",
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="rounded-lg bg-[#ff3b5c]/15 p-2">
          <Users className="h-6 w-6 text-[#ff3b5c]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-neutral-100">
            Promote to Carmunity
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft a community post from this listing, tweak the copy, then publish
            manually. Nothing posts until you click Publish — no automation or
            scheduling.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-neutral-200">Template</Label>
        <Tabs
          value={template}
          onValueChange={(v) => applyTemplate(v as CarmunityPromoTemplate)}
          className="mt-2"
        >
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-black/40 p-1">
            {CARMUNITY_PROMO_TEMPLATES.map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-xs data-[state=active]:bg-[#ff3b5c]/90 data-[state=active]:text-white sm:text-sm"
              >
                {draft.templates[key].label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CARMUNITY_PROMO_TEMPLATES.map((key) => (
            <TabsContent key={key} value={key} className="mt-3">
              <p className="text-xs text-neutral-500">
                {draft.templates[key].description}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="mt-4">
        <Label htmlFor="carmunity-caption" className="text-neutral-200">
          Caption
        </Label>
        <Textarea
          id="carmunity-caption"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2 min-h-[160px] border-white/10 bg-black/30 text-neutral-100"
          placeholder="Edit your post…"
        />
        <p className="mt-2 text-xs text-neutral-500">
          Listing link uses your Carmunity-tracked URL:{" "}
          <span className="break-all text-neutral-400">{draft.listingUrl}</span>
        </p>
      </div>

      {draft.primaryImageUrl ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.primaryImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={includeImage}
              onChange={(e) => setIncludeImage(e.target.checked)}
              className="mt-1 rounded border-white/20 bg-black/40"
            />
            <span>
              Include listing photo on the post (same as community “image URL”
              field — verified server-side from your photos).
            </span>
          </label>
        </div>
      ) : (
        <p className="mt-4 text-xs text-neutral-500">
          Add photos to this listing to attach an image to the community post.
        </p>
      )}

      <div className="mt-6">
        <Label className="text-neutral-200">Preview</Label>
        <div className="mt-2 max-w-lg">
          <CarmunityPostPreview
            handle={handle}
            displayName={displayName}
            avatarUrl={avatarUrl}
            content={content}
            imageUrl={draft.primaryImageUrl}
            showImage={includeImage && !!draft.primaryImageUrl}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="performance"
          disabled={
            publishing ||
            (!content.trim() &&
              !(includeImage && !!draft.primaryImageUrl))
          }
          onClick={() => void onPublish()}
        >
          {publishing ? "Publishing…" : "Publish to Carmunity"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/explore">Open community feed</Link>
        </Button>
      </div>
    </div>
  );
}
