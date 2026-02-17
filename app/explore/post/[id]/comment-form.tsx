"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addComment } from "@/app/explore/actions";
import { useToast } from "@/components/ui/use-toast";

export function CommentForm({
  postId,
  className,
}: {
  postId: string;
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const result = await addComment(postId, content);
    setLoading(false);
    if (result.ok) {
      setContent("");
      toast({ title: "Comment added" });
      router.refresh();
    } else {
      toast({ title: result.error, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={submit} className={`flex gap-2 ${className ?? ""}`}>
      <Input
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={loading || !content.trim()}>
        {loading ? "…" : "Post"}
      </Button>
    </form>
  );
}
