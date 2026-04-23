"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

function formatListTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type ConversationListRow = {
  id: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  otherParticipants: Array<{
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
    image: string | null;
  }>;
  unreadCount: number;
};

export function MessagesConversationsClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ConversationListRow[]>([]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });
  }, [rows]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages/conversations");
      const j = (await res.json()) as {
        ok?: boolean;
        conversations?: ConversationListRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) throw new Error(j.error ?? "Failed to load conversations.");
      setRows(j.conversations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading conversations">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <InlineSpinner label="Loading conversations" className="text-primary" />
          Loading conversations…
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={`conv-skel-${i}`} className="flex items-center gap-3 px-4 py-3.5">
              <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-muted/40 animate-pulse" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-36 rounded bg-muted/50 animate-pulse" />
                <div className="h-3 w-56 max-w-full rounded bg-muted/40 animate-pulse" />
              </div>
              <div className="h-3 w-10 rounded bg-muted/40 animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 shadow-e1"
        role="alert"
      >
        <p className="text-sm text-destructive">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-border"
          onClick={() => void load()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-e1">
        <p className="text-sm font-medium text-foreground">No conversations yet</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          When someone messages you, or you start a thread from a profile or
          listing context, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-e1">
      {sorted.map((c) => {
        const other = c.otherParticipants[0];
        const display = other?.handle ? `@${other.handle}` : "Conversation";
        const avatar = other?.avatarUrl ?? other?.image ?? undefined;
        const unread = c.unreadCount > 0;
        const listTime = formatListTime(c.lastMessageAt);
        return (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors",
                shellFocusRing,
                "hover:bg-muted/50",
                unread && "bg-primary/5"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0 border border-border">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                  {(other?.handle ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm",
                      unread ? "font-semibold text-foreground" : "font-medium text-foreground"
                    )}
                  >
                    {display}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    {listTime ? (
                      <time
                        className="text-[11px] tabular-nums text-muted-foreground"
                        dateTime={c.lastMessageAt ?? undefined}
                      >
                        {listTime}
                      </time>
                    ) : null}
                    {unread ? (
                      <Badge
                        variant="default"
                        className="h-5 min-w-5 justify-center px-1.5 py-0 text-[10px] font-bold leading-none"
                      >
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {other?.name ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {other.name}
                  </p>
                ) : null}
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {c.lastMessagePreview ?? "No preview yet"}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
