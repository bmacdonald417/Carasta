"use client";

import type { DiscussionReactionKind } from "@prisma/client";
import { ChevronDown, SmilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
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

type Target = "thread" | "reply";

export function DiscussionReactionPicker({
  target,
  targetId,
  summary,
  initialKind,
  className,
}: {
  target: Target;
  targetId: string;
  summary: DiscussionReactionTotals;
  initialKind: DiscussionReactionKind | null;
  className?: string;
}) {
  const router = useRouter();
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
        const res = await fetch("/api/discussions/reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, targetId }),
        });
        if (!res.ok) throw new Error("remove");
      } else {
        const res = await fetch("/api/discussions/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, targetId, kind: next }),
        });
        if (!res.ok) throw new Error("post");
      }
      startTransition(() => router.refresh());
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
    <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
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
              variant="outline"
              size="sm"
              disabled={pending}
              className={cn(
                "h-8 min-w-[2.5rem] gap-1 border-primary/35 bg-primary/5 px-2 text-sm text-primary transition-[transform,box-shadow,opacity,background-color] duration-150 ease-out hover:bg-primary/10 active:scale-[0.98]",
                kind ? "ring-2 ring-primary/30 shadow-sm" : "",
                pending && "opacity-70"
              )}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {kind ? (
                <span className="text-lg leading-none" title={DISCUSSION_REACTION_LABELS[kind]}>
                  {DISCUSSION_REACTION_EMOJI[kind]}
                </span>
              ) : (
                <SmilePlus className="h-4 w-4" aria-hidden />
              )}
              <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
              <span className="sr-only">{kind ? DISCUSSION_REACTION_LABELS[kind] : "React"}</span>
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent
          align="end"
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
