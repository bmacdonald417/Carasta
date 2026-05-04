"use client";

import { useRef, useState } from "react";
import { Film, ImageIcon, PenLine, X, Upload, Loader2 } from "lucide-react";

import { MentionComposerTextarea } from "@/components/carmunity/MentionComposerTextarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";
import { allowedMimeList } from "@/lib/carmunity/carmunity-image-upload";

import { createPost } from "./actions";

type MediaPreview = {
  url: string;
  isVideo: boolean;
  name: string;
};

export function CreatePostForm({
  onCreated,
  className,
}: {
  onCreated?: () => void;
  className?: string;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const acceptMimes = allowedMimeList();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/carmunity/media/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json() as {
        ok: boolean;
        mediaUrl?: string;
        imageUrl?: string;
        isVideo?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast({ title: data.error ?? "Upload failed", variant: "destructive" });
        return;
      }
      const url = data.mediaUrl ?? data.imageUrl ?? "";
      setMedia({ url, isVideo: data.isVideo ?? false, name: file.name });
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !media) {
      toast({ title: "Add text or a photo/video", variant: "destructive" });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("content", content);
    formData.set("imageUrl", media?.url ?? "");
    const result = await createPost(formData);
    setLoading(false);
    if (result.ok) {
      setContent("");
      setMedia(null);
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
        "scroll-mt-28 rounded-2xl border border-border/80 bg-card p-4 shadow-e2 ring-1 ring-primary/[0.08] sm:p-5",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-foreground">
            <PenLine className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="text-sm font-bold tracking-tight">What&apos;s on your mind?</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Share to your followers — type @ to mention.
          </p>
        </div>
        <span className="tabular-nums text-[11px] text-muted-foreground">{content.length} / 8000</span>
      </div>

      <MentionComposerTextarea
        id="post-content"
        value={content}
        onChange={setContent}
        placeholder="Garage shot, build update, or a question for the lane…"
        className="min-h-[96px] resize-none border-border bg-background text-[15px] leading-relaxed"
        maxLength={8000}
      />

      {/* Media preview */}
      {media && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20 shadow-e1">
          {media.isVideo ? (
            <div className="relative aspect-video w-full bg-black">
              <video
                src={media.url}
                controls
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            // Use plain <img> — the URL is a relative path from local upload
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt="Media preview"
              className="max-h-48 w-full object-cover"
            />
          )}
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
              {media.isVideo ? (
                <Film className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : (
                <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span className="truncate">{media.name}</span>
            </p>
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove media"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept={acceptMimes}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {/* Toolbar + submit */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !!media}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-muted/50 hover:text-foreground disabled:opacity-50",
              shellFocusRing
            )}
            title="Upload photo or video"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" aria-hidden />
            )}
            {uploading ? "Uploading…" : "Photo / Video"}
          </button>
          <span className="text-[10px] text-muted-foreground">
            JPEG, PNG, WebP, GIF, HEIC, MP4, MOV, WebM
          </span>
        </div>
        <Button
          type="submit"
          variant="default"
          size="sm"
          className={cn("rounded-full px-5", shellFocusRing)}
          disabled={loading || uploading}
        >
          {loading ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
