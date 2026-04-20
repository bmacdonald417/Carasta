"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type UserMini = {
  id: string;
  handle: string;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
};

type MessageRow = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  isEdited: boolean;
  isSystem: boolean;
  sender: UserMini;
};

type ConversationPayload = {
  id: string;
  auctionId?: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  participants: Array<{ user: UserMini }>;
  auction?: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    status: string;
    endAt: string;
    buyNowPriceCents: number | null;
    reservePriceCents: number | null;
    images: Array<{ url: string }>;
    seller: UserMini;
  } | null;
};

export function ConversationClient({
  conversationId,
  viewerId,
}: {
  conversationId: string;
  viewerId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationPayload | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const other = useMemo(() => {
    const parts = conversation?.participants ?? [];
    const u = parts.map((p) => p.user).find((p) => p.id !== viewerId);
    return u ?? (parts.length > 0 ? parts[0].user : null);
  }, [conversation, viewerId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages/conversations/${encodeURIComponent(conversationId)}?limit=60`);
      const j = (await res.json()) as {
        ok?: boolean;
        conversation?: ConversationPayload;
        messages?: MessageRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) throw new Error(j.error ?? "Failed to load conversation.");
      setConversation(j.conversation ?? null);
      setMessages((j.messages ?? []).slice().reverse());
      // Mark read best-effort.
      void fetch(`/api/messages/conversations/${encodeURIComponent(conversationId)}/read`, { method: "PATCH" });
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" as any });
      }, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversation.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function send() {
    if (sending) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: trimmed }),
        }
      );
      const j = (await res.json()) as { ok?: boolean; message?: MessageRow; error?: string };
      if (!res.ok || !j.ok || !j.message) throw new Error(j.error ?? "Send failed.");
      setMessages((prev) => [...prev, j.message!]);
      setBody("");
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

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
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/messages">Back</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[520px] flex-col rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-100">
            <Link href="/messages">Back</Link>
          </Button>
          {other ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarImage src={other.avatarUrl ?? other.image ?? undefined} />
                <AvatarFallback className="bg-neutral-800 text-xs text-neutral-300">
                  {(other.handle ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-100">@{other.handle}</p>
                <p className="truncate text-[11px] text-neutral-500">{other.name ?? " "}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-neutral-100">Conversation</p>
          )}
        </div>
      </div>

      {conversation?.auction ? (
        <div className="border-b border-white/10 px-4 py-3">
          <Link
            href={`/auctions/${conversation.auction.id}`}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-black/30"
          >
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30">
              {conversation.auction.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={conversation.auction.images[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-100">
                {conversation.auction.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {conversation.auction.year} {conversation.auction.make} {conversation.auction.model}
                {conversation.auction.trim ? ` ${conversation.auction.trim}` : ""} ·{" "}
                {conversation.auction.status}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-600">
                View listing
              </p>
            </div>
          </Link>
        </div>
      ) : null}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === viewerId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-black/40 text-neutral-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        {error ? <p className="mb-2 text-xs text-red-300">{error}</p> : null}
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            className="resize-none bg-black/30 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
          />
          <Button
            type="button"
            className="bg-[#ff3b5c] text-white hover:bg-[#ff3b5c]/90"
            disabled={sending || body.trim().length === 0}
            onClick={() => void send()}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-neutral-600">
          Keep it respectful. Blocks prevent new messages.
        </p>
      </div>
    </div>
  );
}

