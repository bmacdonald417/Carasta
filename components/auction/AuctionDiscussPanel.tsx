"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";

import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import type { AuctionDiscussionThreadRow } from "@/lib/forums/auction-discussion";
import {
  AUCTION_DISCUSSION_CATEGORY_SLUG,
  AUCTION_DISCUSSION_SPACE_SLUG,
} from "@/lib/forums/auction-discussion-constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export function AuctionDiscussPanel({
  auctionId,
  auctionTitle,
  threads,
  threadCount,
  threadReactionTotal,
  isLoggedIn,
}: {
  auctionId: string;
  auctionTitle: string;
  threads: AuctionDiscussionThreadRow[];
  threadCount: number;
  threadReactionTotal: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const primary = threads[0] ?? null;

  async function startThread() {
    if (!isLoggedIn) {
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/auctions/${auctionId}`)}`);
      return;
    }
    setBusy(true);
    try {
      const extra = note.trim();
      const body =
        extra.length > 0
          ? `${extra}\n\n---\nListing: /auctions/${auctionId}`
          : undefined;
      const res = await fetch(`/api/auctions/${auctionId}/discussion-thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          body
            ? {
                title: `Discussion: ${auctionTitle}`.slice(0, 200),
                body,
              }
            : {}
        ),
      });
      const j = (await res.json().catch(() => ({}))) as { message?: string; threadId?: string };
      if (!res.ok) {
        toast({ title: j.message ?? "Could not start discussion", variant: "destructive" });
        return;
      }
      toast({ title: "Discussion started" });
      router.refresh();
      if (j.threadId) {
        router.push(
          discussionThreadPath(
            AUCTION_DISCUSSION_SPACE_SLUG,
            AUCTION_DISCUSSION_CATEGORY_SLUG,
            j.threadId
          )
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent p-[1px]">
      <div className="rounded-2xl border border-white/10 bg-[#0c0c10]/85 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Carmunity
            </p>
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              Discuss this auction
            </h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Questions, inspection context, and community signal — same Discussions system as the rest
              of Carmunity, linked to this listing.
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              {threadCount === 0
                ? "No threads yet for this listing."
                : `${threadCount} thread${threadCount === 1 ? "" : "s"} · ${threadReactionTotal} thread reaction${
                    threadReactionTotal === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          {primary ? (
            <Button
              asChild
              size="sm"
              className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Link
                href={discussionThreadPath(primary.gearSlug, primary.lowerGearSlug, primary.id)}
              >
                <MessagesSquare className="mr-2 h-4 w-4" />
                Open discussion
              </Link>
            </Button>
          ) : null}
        </div>

        {threads.length > 0 ? (
          <ul className="mt-4 space-y-2 divide-y divide-white/5 rounded-xl border border-white/10 bg-black/20">
            {threads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className="block px-3 py-2.5 text-sm text-neutral-200 transition hover:bg-white/5 hover:text-primary"
                >
                  <span className="line-clamp-2 font-medium text-foreground">{t.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"} · {t.reactionCount} reactions
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {!primary ? (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => {
                if (!isLoggedIn) {
                  router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/auctions/${auctionId}`)}`);
                  return;
                }
                setOpen((v) => !v);
              }}
              className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              {isLoggedIn ? "Start a discussion" : "Sign in to discuss"}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (!isLoggedIn) {
                  router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/auctions/${auctionId}`)}`);
                  return;
                }
                setOpen((v) => !v);
              }}
              className="border-primary/35 text-primary hover:bg-primary/10"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Add another thread
            </Button>
          )}
        </div>

        {open && isLoggedIn ? (
          <div className="mt-4 space-y-2 rounded-xl border border-border/50 bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">
              Optional note for the first post (you can edit tone; a link to this listing is added
              automatically).
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="e.g. Asking about service history visibility, PPI scope, or transport…"
              className="border-white/10 bg-black/30 text-sm text-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={busy} onClick={startThread}>
                {busy ? "Creating…" : "Create thread"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
