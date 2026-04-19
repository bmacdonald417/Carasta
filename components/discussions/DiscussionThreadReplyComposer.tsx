"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function DiscussionThreadReplyComposer({
  threadId,
  locked,
  parentReplyId,
  onPosted,
  signInCallbackUrl,
}: {
  threadId: string;
  locked: boolean;
  parentReplyId?: string | null;
  onPosted?: () => void;
  signInCallbackUrl?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const callbackUrl = signInCallbackUrl ?? (pathname || "/discussions");
  const { data: session, status } = useSession();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (locked) {
    return (
      <p className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        This thread is locked — new replies are disabled.
      </p>
    );
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading session…</p>;
  }

  if (!session?.user) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
        <Link
          href={`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-primary hover:underline"
        >
          Sign in
        </Link>{" "}
        to join the conversation.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write something first.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/discussions/threads/${encodeURIComponent(threadId)}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          parentReplyId: parentReplyId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Could not post reply.");
        return;
      }
      setBody("");
      onPosted?.();
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border/60 bg-card/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your reply</p>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share perspective, data, or encouragement…"
        rows={4}
        className="resize-y bg-background/80"
        maxLength={8000}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Tip: mention someone with <span className="font-mono text-primary/90">@handle</span> — valid handles
          become profile links and send a notification.
        </p>
        <Button type="submit" variant="performance" size="sm" disabled={sending}>
          {sending ? "Posting…" : "Post reply"}
        </Button>
      </div>
    </form>
  );
}
