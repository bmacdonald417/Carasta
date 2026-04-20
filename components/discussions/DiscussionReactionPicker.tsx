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
import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import {
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
  const [open, setOpen] = useState(false);
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
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            className={cn(
              "h-8 border-primary/35 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary transition-[transform,box-shadow,opacity,background-color] duration-150 ease-out hover:bg-primary/10 active:scale-[0.98]",
              kind ? "ring-2 ring-primary/30 shadow-sm" : "",
              pending && "opacity-70"
            )}
          >
            <SmilePlus className="mr-1.5 h-3.5 w-3.5" />
            {kind ? DISCUSSION_REACTION_LABELS[kind] : "React"}
            <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[200px] border-border/60 bg-popover/95 text-popover-foreground"
        >
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Pick a reaction</p>
          <DropdownMenuSeparator />
          {DISCUSSION_REACTION_KIND_ORDER.map((k) => (
            <DropdownMenuItem
              key={k}
              className={cn(
                "cursor-pointer text-sm transition-colors duration-150",
                kind === k ? "bg-primary/10 text-primary" : ""
              )}
              onClick={() => {
                void applyKind(k);
                setOpen(false);
              }}
            >
              {DISCUSSION_REACTION_LABELS[k]}
            </DropdownMenuItem>
          ))}
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
