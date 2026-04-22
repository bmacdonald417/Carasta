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
import { SellerSectionPanel } from "@/components/marketing/seller-workspace-primitives";

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
    <SellerSectionPanel
      title="Promote to Carmunity"
      description="Draft from this listing, edit, then publish. This stays manual by design so sellers can keep control over how listing promotion shows up in Carmunity."
      tone="info"
    >
      <div className="mb-4 flex items-center gap-3 rounded-[1.25rem] border border-[hsl(var(--seller-info))]/15 bg-[hsl(var(--seller-info-soft))] px-4 py-3 text-[hsl(var(--seller-info-foreground))]">
        <div className="rounded-xl bg-white/75 p-2">
          <Users className="h-6 w-6" />
        </div>
        <p className="text-sm">
          Use this module when the listing needs community visibility, not just
          a share link.
        </p>
      </div>

      <div className="mt-6">
        <Label className="text-[hsl(var(--seller-foreground))]">Template</Label>
        <Tabs
          value={template}
          onValueChange={(v) => applyTemplate(v as CarmunityPromoTemplate)}
          className="mt-2"
        >
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-[hsl(var(--seller-panel-muted))] p-1">
            {CARMUNITY_PROMO_TEMPLATES.map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-xs data-[state=active]:bg-[hsl(var(--seller-info))] data-[state=active]:text-white sm:text-sm"
              >
                {draft.templates[key].label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CARMUNITY_PROMO_TEMPLATES.map((key) => (
            <TabsContent key={key} value={key} className="mt-3">
              <p className="text-xs text-[hsl(var(--seller-muted))]">
                {draft.templates[key].description}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="mt-4">
        <Label htmlFor="carmunity-caption" className="text-[hsl(var(--seller-foreground))]">
          Caption
        </Label>
        <Textarea
          id="carmunity-caption"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2 min-h-[160px] border-[hsl(var(--seller-border))] bg-white text-[hsl(var(--seller-foreground))]"
          placeholder="Edit your post…"
        />
        <p className="mt-2 text-xs text-[hsl(var(--seller-muted))]">
          Listing link uses your Carmunity-tracked URL:{" "}
          <span className="break-all text-[hsl(var(--seller-foreground))]">{draft.listingUrl}</span>
        </p>
      </div>

      {draft.primaryImageUrl ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-[1.25rem] border border-[hsl(var(--seller-border))] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.primaryImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-[hsl(var(--seller-foreground))]">
            <input
              type="checkbox"
              checked={includeImage}
              onChange={(e) => setIncludeImage(e.target.checked)}
              className="mt-1 rounded border-[hsl(var(--seller-border))] bg-white"
            />
            <span>
              Include listing photo on the post (same as community “image URL”
              field — verified server-side from your photos).
            </span>
          </label>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[hsl(var(--seller-muted))]">
          Add photos to this listing to attach an image to the community post.
        </p>
      )}

      <div className="mt-6">
        <Label className="text-[hsl(var(--seller-foreground))]">Preview</Label>
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
          variant="default"
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
          <Link href="/explore">Open Carmunity feed</Link>
        </Button>
      </div>
    </SellerSectionPanel>
  );
}
