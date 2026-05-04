"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck, MoreHorizontal, Paperclip, Phone, Send, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  participants: Array<{ user: UserMini }>;
  auction?: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    status: string;
    images: Array<{ url: string }>;
  } | null;
};

const EMOJI_QUICK = ["👍", "❤️", "😂", "🔥", "🏎️", "🔧", "🙌", "😎", "👀", "✅", "💯", "🤝"];

function fmtMsgTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );
}

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
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const other = useMemo(() => {
    const parts = conversation?.participants ?? [];
    return parts.map((p) => p.user).find((p) => p.id !== viewerId) ?? null;
  }, [conversation, viewerId]);

  // Close emoji picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showEmoji]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(conversationId)}?limit=80`
      );
      const j = (await res.json()) as {
        ok?: boolean;
        conversation?: ConversationPayload;
        messages?: MessageRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) throw new Error(j.error ?? "Failed to load.");
      setConversation(j.conversation ?? null);
      setMessages((j.messages ?? []).slice().reverse());
      void fetch(`/api/messages/conversations/${encodeURIComponent(conversationId)}/read`, { method: "PATCH" });
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" }), 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [conversationId]);

  async function send() {
    if (sending) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);
    setBody("");
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
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 30);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed.");
      setBody(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden rounded-none">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="h-5 w-36 rounded bg-muted/50 animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto bg-muted/5 px-4 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
              <div className="h-12 w-52 max-w-[70%] rounded-2xl bg-muted/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <p className="text-sm text-destructive">{error}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/messages">Back</Link></Button>
          <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted/60">
          <Link href="/messages"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        {other ? (
          <Link href={`/u/${other.handle}`} className="flex min-w-0 flex-1 items-center gap-3 group">
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 border border-border/60">
                <AvatarImage src={other.avatarUrl ?? other.image ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {(other.handle ?? "C").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                {other.name?.trim() || `@${other.handle}`}
              </p>
              <p className="text-xs text-muted-foreground">@{other.handle} · Active recently</p>
            </div>
          </Link>
        ) : (
          <p className="flex-1 font-semibold text-foreground">Conversation</p>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" disabled title="Coming soon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Auction context */}
      {conversation?.auction && (
        <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2.5">
          <Link href={`/auctions/${conversation.auction.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition hover:border-primary/30 hover:bg-muted/30">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {conversation.auction.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={conversation.auction.images[0].url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">No photo</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{conversation.auction.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {conversation.auction.year} {conversation.auction.make} {conversation.auction.model} ·{" "}
                <span className="font-medium text-primary">{conversation.auction.status}</span>
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-muted/5 px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-2">
          {messages.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Say hi — this is the start of your conversation with {other?.name?.trim() || `@${other?.handle}`}.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === viewerId;
            if (m.isSystem) {
              return (
                <div key={m.id} className="flex justify-center py-1">
                  <p className="rounded-full border border-border bg-muted/60 px-4 py-1.5 text-center text-[11px] text-muted-foreground">
                    {m.body}
                  </p>
                </div>
              );
            }
            return (
              <div key={m.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                {!mine && (
                  <Avatar className="h-7 w-7 shrink-0 border border-border/60 mb-0.5">
                    <AvatarImage src={other?.avatarUrl ?? other?.image ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {(other?.handle ?? "C").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-[min(75%,28rem)]">
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border border-border/60 bg-card text-foreground"
                  )}>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                  <div className={cn("mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", mine ? "justify-end" : "justify-start")}>
                    <span>{fmtMsgTime(m.createdAt)}</span>
                    {mine && <CheckCheck className="h-3 w-3 text-primary/60" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-card px-3 py-3">
        {error && conversation && (
          <p className="mb-2 text-xs font-medium text-destructive">{error}</p>
        )}
        <div className="flex items-end gap-2">
          {/* Emoji + attach */}
          <div className="flex shrink-0 flex-col gap-1">
            <div className="relative" ref={emojiRef}>
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/60 hover:text-primary"
                title="Emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmoji && (
                <div className="absolute bottom-full left-0 mb-2 z-50 rounded-xl border border-border bg-card p-2 shadow-e2">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_QUICK.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setBody((prev) => prev + e);
                          setShowEmoji(false);
                          inputRef.current?.focus();
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition hover:bg-muted/60"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/50 transition"
              title="Attachment (coming soon)"
              disabled
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-2xl border border-border/70 bg-muted/30 px-4 py-2.5 text-sm leading-relaxed text-foreground",
              "placeholder:text-muted-foreground/60 max-h-32 min-h-[2.5rem]",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            )}
            placeholder="Message…"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
            }}
            onKeyDown={onKeyDown}
          />

          {/* Send */}
          <button
            type="button"
            disabled={sending || !body.trim()}
            onClick={() => void send()}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition",
              body.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" : "bg-muted/40 text-muted-foreground"
            )}
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
