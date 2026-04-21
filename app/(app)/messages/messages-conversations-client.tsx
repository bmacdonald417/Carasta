"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { isReviewModeClient } from "@/components/review-mode/review-mode-client";

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
  const reviewMode = isReviewModeClient();
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
      const j = (await res.json()) as { ok?: boolean; conversations?: ConversationListRow[]; error?: string };
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
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-neutral-300">{error}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm font-medium text-neutral-200">No messages yet</p>
        <p className="mt-2 text-xs text-neutral-500">
          Start a conversation from someone’s profile (Phase Q follow-up) or via API.
        </p>
        {reviewMode ? (
          <p className="mt-2 text-xs text-amber-300">
            Review mode uses demo conversations when available.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {sorted.map((c) => {
        const other = c.otherParticipants[0];
        const display = other?.handle ? `@${other.handle}` : "Conversation";
        const avatar = other?.avatarUrl ?? other?.image ?? undefined;
        return (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5"
            >
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-neutral-800 text-xs text-neutral-300">
                  {(other?.handle ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-foreground">{display}</p>
                  {c.unreadCount > 0 ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                  {c.lastMessagePreview ?? "—"}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

