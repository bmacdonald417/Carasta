"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPost } from "./actions";
import { useToast } from "@/components/ui/use-toast";

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
      onSubmit={submit}
      className={`rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <PenLine className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
          Share to Carmunity
        </span>
      </div>
      <Label htmlFor="post-content" className="sr-only">
        Post body
      </Label>
      <Textarea
        id="post-content"
        placeholder="Build update, garage shot, or what you’re chasing…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[88px] resize-none border-border/60 bg-background/60 text-[15px] leading-relaxed"
      />
      <div className="mt-3">
        <Label htmlFor="post-image" className="text-xs text-muted-foreground">
          Image URL (optional)
        </Label>
        <Input
          id="post-image"
          type="url"
          placeholder="https://…"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 border-border/60 bg-background/60"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" variant="default" size="sm" disabled={loading}>
          {loading ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
