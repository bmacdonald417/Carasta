"use client";

import type { DiscussionReactionKind } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DiscussionReactionPicker } from "@/components/discussions/DiscussionReactionPicker";
import { DiscussionReportDialog } from "@/components/discussions/DiscussionReportDialog";
import { DiscussionRichText } from "@/components/discussions/DiscussionRichText";
import { DiscussionThreadReplyComposer } from "@/components/discussions/DiscussionThreadReplyComposer";
import { ThreadVoteButton } from "@/components/discussions/ThreadVoteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuestGate } from "@/components/guest-gate/GuestGateProvider";
import { discussionReplyAnchorId } from "@/lib/discussions/discussion-paths";
import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export type SerializedThreadReply = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  demoSeed: boolean;
  contentWithdrawn?: boolean;
  reactionSummary: DiscussionReactionTotals;
  viewerReactionKind: DiscussionReactionKind | null;
  author: { handle: string; name: string | null };
};

function formatLong(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function DiscussionThreadRepliesPanel({
  threadId,
  viewerUserId,
  locked,
  replyCount,
  initialReplies,
  initialNextCursor,
  validMentionHandles,
}: {
  threadId: string;
  viewerUserId: string | null;
  locked: boolean;
  replyCount: number;
  initialReplies: SerializedThreadReply[];
  initialNextCursor: string | null;
  validMentionHandles: string[];
}) {
  const pathname = usePathname();
  const { openGate } = useGuestGate();
  const [parentReplyId, setParentReplyId] = useState<string | null>(null);
  const [replies, setReplies] = useState(initialReplies);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setReplies(initialReplies);
    setNextCursor(initialNextCursor);
  }, [initialReplies, initialNextCursor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("discussion-reply-")) return;
    const el = document.getElementById(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const parentPreview = useMemo(() => {
    if (!parentReplyId) return null;
    return replies.find((r) => r.id === parentReplyId) ?? null;
  }, [parentReplyId, replies]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const qs = new URLSearchParams({ cursor: nextCursor, take: "40" });
      const res = await fetch(
        `/api/discussions/threads/${encodeURIComponent(threadId)}/replies?${qs.toString()}`
      );
      const data = (await res.json()) as {
        replies: SerializedThreadReply[];
        nextCursor: string | null;
      };
      if (!res.ok) return;
      setReplies((prev) => [...prev, ...data.replies]);
      setNextCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Comments <span className="font-normal text-muted-foreground">({replyCount})</span>
        </h2>
        <p className="text-[11px] text-muted-foreground">sorted by best</p>
      </div>

      <ul className="space-y-0">
        {replies.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center shadow-e1">
            <p className="text-sm font-semibold text-foreground">No comments yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Add the first comment — type <span className="font-mono text-primary/90">@handle</span> to mention someone.
            </p>
          </li>
        ) : (
          replies.map((r) => (
            <li
              key={r.id}
              id={discussionReplyAnchorId(r.id)}
              className="scroll-mt-24 border-b border-border/50 py-3"
            >
              <div className="flex gap-2">
                {/* Vote column for reply */}
                <div className="flex shrink-0 flex-col items-center pt-0.5">
                  <ThreadVoteButton
                    threadId={threadId}
                    replyId={r.id}
                    initialUpCount={r.reactionSummary?.byKind?.LIKE ?? 0}
                    initialDownCount={r.reactionSummary?.byKind?.DISLIKE ?? 0}
                    compact
                  />
                </div>

                {/* Reply body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    <AuthorHandleLink handle={r.author.handle} className="text-xs font-semibold text-foreground" />
                    {r.author.name && (
                      <span className="text-muted-foreground">· {r.author.name}</span>
                    )}
                    <span>·</span>
                    <span>{formatLong(r.createdAt)}</span>
                    {r.demoSeed && (
                      <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[9px] font-semibold uppercase">
                        Demo
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1.5 text-sm leading-relaxed text-foreground">
                    {r.contentWithdrawn ? (
                      <span className="italic text-muted-foreground">[comment removed]</span>
                    ) : (
                      <DiscussionRichText text={r.body} validHandles={validMentionHandles} />
                    )}
                  </div>

                  {/* Reply actions */}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {!r.contentWithdrawn && (
                      <>
                        {!r.contentWithdrawn ? (
                          <DiscussionReactionPicker
                            target="reply"
                            targetId={r.id}
                            summary={r.reactionSummary}
                            initialKind={r.viewerReactionKind}
                          />
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-[11px] font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            shellFocusRing
                          )}
                          onClick={() => {
                            if (!viewerUserId) {
                              openGate({ intent: "reply", nextUrl: pathname || "/discussions" });
                              return;
                            }
                            setParentReplyId(r.id);
                          }}
                        >
                          Reply
                        </Button>
                        {viewerUserId && viewerUserId !== r.authorId && (
                          <DiscussionReportDialog
                            target="reply"
                            threadId={threadId}
                            replyId={r.id}
                            contentLabel={`Reporting a reply by @${r.author.handle}`}
                            variant="ghost"
                          />
                        )}
                      </>
                    )}
                    {parentReplyId === r.id && (
                      <span className="text-[11px] font-medium text-primary">↩ replying to this</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {nextCursor ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingMore}
            onClick={() => void loadMore()}
            className={cn(
              "border-border text-xs font-semibold text-primary hover:bg-muted/50",
              shellFocusRing
            )}
          >
            {loadingMore ? "Loading…" : "Load more replies"}
          </Button>
        </div>
      ) : null}

      {parentPreview ? (
        <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground shadow-e1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0">
              <span className="font-semibold text-foreground">Replying to </span>
              <AuthorHandleLink handle={parentPreview.author.handle} className="text-xs" />
              <span className="mx-1 text-muted-foreground/60">·</span>
              <span className="line-clamp-2 text-muted-foreground">
                {parentPreview.contentWithdrawn
                  ? "This content has been removed."
                  : parentPreview.body}
              </span>
            </p>
            <button
              type="button"
              className={cn(
                "shrink-0 text-[11px] font-medium text-primary hover:underline",
                shellFocusRing,
                "rounded-sm px-0.5"
              )}
              onClick={() => setParentReplyId(null)}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <DiscussionThreadReplyComposer
        threadId={threadId}
        locked={locked}
        parentReplyId={parentReplyId}
        onPosted={() => setParentReplyId(null)}
        signInCallbackUrl={pathname || "/discussions"}
      />
    </section>
  );
}
