"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { addComment } from "@/app/(marketing)/explore/actions";
import { useToast } from "@/components/ui/use-toast";
import { LoadingButton } from "@/components/ui/loading-button";

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
    <form onSubmit={submit} className={`flex flex-wrap gap-2 sm:flex-nowrap ${className ?? ""}`}>
      <Input
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-w-0 flex-1 border-border bg-background"
      />
      <LoadingButton
        type="submit"
        size="sm"
        loading={loading}
        loadingLabel="Posting…"
        disabled={!content.trim()}
      >
        Post
      </LoadingButton>
    </form>
  );
}
