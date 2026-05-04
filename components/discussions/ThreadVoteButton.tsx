"use client";

import { useState } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGuestGate } from "@/components/guest-gate/GuestGateProvider";
import { cn } from "@/lib/utils";

type VoteDirection = "up" | "down" | "none";

export function ThreadVoteButton({
  threadId,
  replyId,
  initialUpCount = 0,
  initialDownCount = 0,
  initialDirection = "none",
  compact = false,
}: {
  threadId: string;
  replyId?: string;
  initialUpCount?: number;
  initialDownCount?: number;
  initialDirection?: VoteDirection;
  compact?: boolean;
}) {
  const { data: session } = useSession();
  const { openGate } = useGuestGate();
  const [direction, setDirection] = useState<VoteDirection>(initialDirection);
  const [upCount, setUpCount] = useState(initialUpCount);
  const [downCount, setDownCount] = useState(initialDownCount);
  const [pending, setPending] = useState(false);

  const score = upCount - downCount;

  async function vote(next: VoteDirection) {
    if (!session?.user) {
      openGate({ intent: "react" });
      return;
    }
    if (pending) return;
    const prev = direction;
    const finalDirection = prev === next ? "none" : next;

    // Optimistic update
    setDirection(finalDirection);
    if (prev === "up") setUpCount((c) => c - 1);
    if (prev === "down") setDownCount((c) => c - 1);
    if (finalDirection === "up") setUpCount((c) => c + 1);
    if (finalDirection === "down") setDownCount((c) => c + 1);

    setPending(true);
    try {
      const url = replyId
        ? `/api/discussions/threads/${encodeURIComponent(threadId)}/replies/${encodeURIComponent(replyId)}/vote`
        : `/api/discussions/threads/${encodeURIComponent(threadId)}/vote`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: finalDirection }),
      });
      if (res.ok) {
        const data = await res.json() as { upCount: number; downCount: number; direction: VoteDirection };
        setUpCount(data.upCount);
        setDownCount(data.downCount);
        setDirection(data.direction);
      }
    } catch {
      // Rollback on error
      setDirection(prev);
      if (prev === "up") setUpCount((c) => c + 1);
      if (prev === "down") setDownCount((c) => c + 1);
      if (finalDirection === "up") setUpCount((c) => c - 1);
      if (finalDirection === "down") setDownCount((c) => c - 1);
    } finally {
      setPending(false);
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => void vote("up")}
          disabled={pending}
          aria-label="Upvote"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded transition-colors disabled:opacity-50",
            direction === "up"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <ArrowBigUp className="h-4 w-4" fill={direction === "up" ? "currentColor" : "none"} />
        </button>
        <span
          className={cn(
            "min-w-[1.5rem] text-center text-xs font-semibold tabular-nums",
            direction === "up" ? "text-primary" : direction === "down" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {score}
        </span>
        <button
          type="button"
          onClick={() => void vote("down")}
          disabled={pending}
          aria-label="Downvote"
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded transition-colors disabled:opacity-50",
            direction === "down"
              ? "text-destructive"
              : "text-muted-foreground hover:text-destructive"
          )}
        >
          <ArrowBigDown className="h-4 w-4" fill={direction === "down" ? "currentColor" : "none"} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => void vote("up")}
        disabled={pending}
        aria-label="Upvote"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50",
          direction === "up"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted/60 hover:text-primary"
        )}
      >
        <ArrowBigUp className="h-5 w-5" fill={direction === "up" ? "currentColor" : "none"} />
      </button>
      <span
        className={cn(
          "text-sm font-bold tabular-nums leading-none",
          direction === "up" ? "text-primary" : direction === "down" ? "text-destructive" : "text-foreground"
        )}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => void vote("down")}
        disabled={pending}
        aria-label="Downvote"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50",
          direction === "down"
            ? "bg-destructive/10 text-destructive"
            : "text-muted-foreground hover:bg-muted/60 hover:text-destructive"
        )}
      >
        <ArrowBigDown className="h-5 w-5" fill={direction === "down" ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
