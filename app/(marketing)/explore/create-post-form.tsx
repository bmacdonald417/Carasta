"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageIcon, PenLine } from "lucide-react";

import { MentionComposerTextarea } from "@/components/carmunity/MentionComposerTextarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

import { createPost } from "./actions";

function looksLikeHttpUrl(s: string) {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function CreatePostForm({
  onCreated,
  className,
}: {
  onCreated?: () => void;
  className?: string;
}) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const previewUrl = useMemo(() => {
    const t = imageUrl.trim();
    if (!t || !looksLikeHttpUrl(t)) return null;
    return t;
  }, [imageUrl]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim()) {
      toast({ title: "Add text or a photo", variant: "destructive" });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("content", content);
    formData.set("imageUrl", imageUrl);
    const result = await createPost(formData);
    setLoading(false);
    if (result.ok) {
      setContent("");
      setImageUrl("");
      onCreated?.();
      toast({ title: "Post created" });
    } else {
      toast({ title: result.error, variant: "destructive" });
    }
  }

  return (
    <form
      id="carmunity-create-post"
      onSubmit={submit}
      className={cn(
        "scroll-mt-28 rounded-2xl border border-border bg-card p-4 shadow-e1 sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <PenLine className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-xs font-semibold tracking-wide text-foreground">Share to Carmunity</span>
        </div>
        <span className="tabular-nums text-[11px] text-muted-foreground">{content.length} / 8000</span>
      </div>
      <Label htmlFor="post-content" className="sr-only">
        Post body
      </Label>
      <MentionComposerTextarea
        id="post-content"
        value={content}
        onChange={setContent}
        placeholder="Garage shot, build note, or a question for the lane — type @ to mention someone."
        className="min-h-[96px] resize-none border-border bg-background text-[15px] leading-relaxed"
        maxLength={8000}
      />
      <div className="mt-4 space-y-2">
        <Label htmlFor="post-image" className="text-xs text-muted-foreground">
          Image URL (optional)
        </Label>
        <Input
          id="post-image"
          type="url"
          placeholder="https://…"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border-border bg-background"
        />
        {previewUrl ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-muted/20 shadow-e1">
            <div className="relative aspect-[16/9] w-full max-h-48 bg-muted">
              <Image
                src={previewUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
            <p className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Preview — Carmunity will store the URL you post.
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          type="submit"
          variant="default"
          size="sm"
          className={cn("rounded-full px-5", shellFocusRing)}
          disabled={loading}
        >
          {loading ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
