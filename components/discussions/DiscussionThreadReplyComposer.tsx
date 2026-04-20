"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MentionComposerTextarea } from "@/components/carmunity/MentionComposerTextarea";
import { Button } from "@/components/ui/button";

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
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border/50 bg-card/55 p-4 shadow-sm backdrop-blur-sm sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/90">Reply</p>
          <p className="text-sm font-medium text-foreground">Join the thread</p>
        </div>
        <span className="tabular-nums text-[11px] text-muted-foreground">{body.length} / 8000</span>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <MentionComposerTextarea
        threadId={threadId}
        value={body}
        onChange={setBody}
        placeholder="Add perspective, data, or encouragement — type @ to mention someone."
        rows={4}
        className="min-h-[108px] resize-y border-border/60 bg-background/70 text-[15px] leading-relaxed"
        maxLength={8000}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/35 pt-3">
        <p className="max-w-xl text-[11px] leading-snug text-muted-foreground">
          <span className="font-mono text-primary/90">@handle</span> linkifies for readers and notifies when the
          handle is valid on Carmunity.
        </p>
        <Button
          type="submit"
          variant="performance"
          size="sm"
          disabled={sending}
          className="shrink-0 rounded-full px-4"
        >
          {sending ? "Posting…" : "Post reply"}
        </Button>
      </div>
    </form>
  );
}
