"use client";

import type { DiscussionReactionKind } from "@prisma/client";
import { ChevronDown, SmilePlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";

import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHoverDropdown } from "@/hooks/use-hover-dropdown";
import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import {
  DISCUSSION_REACTION_EMOJI,
  DISCUSSION_REACTION_KIND_ORDER,
  DISCUSSION_REACTION_LABELS,
} from "@/lib/discussions/reaction-labels";
import { cn } from "@/lib/utils";

export function PostReactionPicker({
  postId,
  summary,
  initialKind,
  onReactionApplied,
  className,
}: {
  postId: string;
  summary: DiscussionReactionTotals;
  initialKind: DiscussionReactionKind | null;
  onReactionApplied?: (args: {
    postId: string;
    prevKind: DiscussionReactionKind | null;
    nextKind: DiscussionReactionKind | null;
  }) => void;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const { open, setOpen, openNow, scheduleClose, cancelClose } = useHoverDropdown(240);
  const [kind, setKind] = useState<DiscussionReactionKind | null>(initialKind);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setKind(initialKind);
  }, [initialKind]);

  const signedIn = Boolean(session?.user);

  async function applyKind(next: DiscussionReactionKind | null) {
    if (!signedIn) return;
    const prevKind = kind;
    setKind(next);
    try {
      if (next === null) {
        const res = await fetch("/api/carmunity/post-reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        if (!res.ok) throw new Error("remove");
      } else {
        const res = await fetch("/api/carmunity/post-reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, kind: next }),
        });
        if (!res.ok) throw new Error("post");
      }
      startTransition(() => {
        onReactionApplied?.({ postId, prevKind, nextKind: next });
      });
    } catch {
      setKind(prevKind);
    }
  }

  if (status === "loading") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <DiscussionReactionSummary summary={summary} />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <DiscussionReactionSummary summary={summary} compact={false} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DiscussionReactionSummary summary={summary} compact={false} viewerActive={Boolean(kind)} />
      <DropdownMenu
        open={open}
        onOpenChange={(v) => {
          if (v) {
            cancelClose();
            setOpen(true);
          } else {
            cancelClose();
            setOpen(false);
          }
        }}
      >
        <div
          className="inline-block"
          onPointerEnter={() => {
            cancelClose();
            openNow();
          }}
          onPointerLeave={() => scheduleClose()}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              className={cn(
                "h-9 min-w-[2.5rem] gap-1 rounded-full px-2 text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-foreground active:scale-[0.98]",
                kind ? "text-primary ring-2 ring-primary/25" : ""
              )}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {kind ? (
                <span className="text-lg leading-none" title={DISCUSSION_REACTION_LABELS[kind]}>
                  {DISCUSSION_REACTION_EMOJI[kind]}
                </span>
              ) : (
                <SmilePlus className="h-[18px] w-[18px]" aria-hidden />
              )}
              <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
              <span className="sr-only">{kind ? DISCUSSION_REACTION_LABELS[kind] : "React"}</span>
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent
          align="start"
          className="min-w-[220px] border-border bg-popover text-popover-foreground shadow-e2"
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Hover or click — pick one</p>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-3 gap-1 p-1">
            {DISCUSSION_REACTION_KIND_ORDER.map((k) => (
              <DropdownMenuItem
                key={k}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-center text-xs transition-colors duration-150",
                  kind === k ? "bg-primary/15 text-primary" : ""
                )}
                onClick={() => {
                  void applyKind(k);
                  setOpen(false);
                }}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {DISCUSSION_REACTION_EMOJI[k]}
                </span>
                <span className="sr-only">{DISCUSSION_REACTION_LABELS[k]}</span>
              </DropdownMenuItem>
            ))}
          </div>
          {kind ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-sm text-muted-foreground"
                onClick={() => {
                  void applyKind(null);
                  setOpen(false);
                }}
              >
                Remove mine
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
