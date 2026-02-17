"use client";

import { useState } from "react";
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
      className={`rounded-2xl border border-border/50 bg-card/80 p-4 ${className ?? ""}`}
    >
      <Label htmlFor="post-content">What’s on your mind?</Label>
      <Textarea
        id="post-content"
        placeholder="Share a build, a find, or a thought..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-2 min-h-[80px]"
      />
      <div className="mt-2">
        <Label htmlFor="post-image" className="text-xs text-muted-foreground">
          Image URL (optional)
        </Label>
        <Input
          id="post-image"
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button
        type="submit"
        variant="performance"
        size="sm"
        className="mt-3"
        disabled={loading}
      >
        {loading ? "Posting…" : "Post"}
      </Button>
    </form>
  );
}
