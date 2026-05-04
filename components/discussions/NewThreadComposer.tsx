"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuestGate } from "@/components/guest-gate/GuestGateProvider";
import { cn } from "@/lib/utils";

export function NewThreadComposer({
  categoryId,
  gearSlug,
  lowerGearSlug,
  className,
}: {
  categoryId: string;
  gearSlug: string;
  lowerGearSlug: string;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const { openGate } = useGuestGate();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => openGate({ intent: "reply", nextUrl: `/discussions/${gearSlug}/${lowerGearSlug}` })}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-e1 transition hover:border-primary/30 hover:bg-muted/30",
          className
        )}
      >
        <PenLine className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        Start a new thread…
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-e1 transition hover:border-primary/30 hover:bg-muted/40",
          className
        )}
      >
        <PenLine className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        Start a new thread…
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const b = body.trim();
    if (!t) { setError("Title is required."); return; }
    if (!b) { setError("Body is required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/forums/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, title: t, body: b }),
      });
      const data = await res.json() as { ok: boolean; threadId?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create thread.");
        return;
      }
      // Navigate to the new thread
      router.push(`/discussions/${gearSlug}/${lowerGearSlug}/${data.threadId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-xl border border-primary/25 bg-card p-4 shadow-e2 ring-1 ring-primary/10",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-primary" aria-hidden />
          <p className="text-sm font-semibold text-foreground">New thread</p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitle(""); setBody(""); setError(null); }}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-2.5">
        <Input
          placeholder="Thread title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="border-border bg-background font-medium"
          required
        />
        <textarea
          placeholder="Share your take, question, or build update. Type @handle to mention someone."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={8000}
          rows={4}
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          required
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] tabular-nums text-muted-foreground">{body.length} / 8000</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setOpen(false); setTitle(""); setBody(""); setError(null); }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="rounded-full px-5">
              {submitting ? "Posting…" : "Post thread"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
