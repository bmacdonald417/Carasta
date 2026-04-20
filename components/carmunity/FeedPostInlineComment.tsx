"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { addComment } from "@/app/(marketing)/explore/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function FeedPostInlineComment({
  postId,
  initialCount,
  onCommented,
  className,
}: {
  postId: string;
  initialCount: number;
  onCommented?: (nextCount: number) => void;
  className?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) {
      toast({ title: "Write a comment first", variant: "destructive" });
      return;
    }
    setSending(true);
    const res = await addComment(postId, trimmed);
    setSending(false);
    if (!res.ok) {
      toast({ title: res.error ?? "Could not comment", variant: "destructive" });
      return;
    }
    setText("");
    setOpen(false);
    onCommented?.("commentCount" in res && typeof res.commentCount === "number" ? res.commentCount : initialCount + 1);
    toast({ title: "Comment posted" });
  }

  return (
    <div className={cn("w-full", className)}>
      {!open ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3 text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-foreground active:scale-[0.98]"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-[18px] w-[18px] shrink-0" />
          <span className="text-xs font-medium">Comment</span>
          <span className="min-w-[1ch] tabular-nums text-xs text-muted-foreground">{initialCount}</span>
        </Button>
      ) : (
        <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something constructive…"
            rows={3}
            maxLength={4000}
            className="resize-y border-border/60 bg-background/70 text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" className="rounded-full px-4" disabled={sending} onClick={() => void submit()}>
              {sending ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
