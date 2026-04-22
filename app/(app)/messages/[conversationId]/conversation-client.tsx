"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { isReviewModeClient } from "@/components/review-mode/review-mode-client";
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
  const reviewMode = isReviewModeClient();
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
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(conversationId)}?limit=60`
      );
      const j = (await res.json()) as {
        ok?: boolean;
        conversation?: ConversationPayload;
        messages?: MessageRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) throw new Error(j.error ?? "Failed to load conversation.");
      setConversation(j.conversation ?? null);
      setMessages((j.messages ?? []).slice().reverse());
      void fetch(`/api/messages/conversations/${encodeURIComponent(conversationId)}/read`, {
        method: "PATCH",
      });
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "auto",
        });
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
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading conversation">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <InlineSpinner label="Loading conversation" className="text-primary" />
          Loading thread…
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-e2 overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <div className="h-4 w-40 rounded bg-muted/50 animate-pulse" />
          </div>
          <div className="space-y-3 px-4 py-4 bg-background/50">
            {Array.from({ length: 6 }).map((_, i) => {
              const mine = i % 2 === 0;
              return (
                <div key={`msg-skel-${i}`} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "h-12 w-[min(70%,22rem)] rounded-2xl border border-border bg-muted/30 animate-pulse"
                    )}
                  />
                </div>
              );
            })}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <div className="h-10 flex-1 rounded-xl border border-border bg-muted/20 animate-pulse" />
              <div className="h-10 w-20 rounded-2xl bg-muted/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div
        className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 shadow-e1"
        role="alert"
      >
        <p className="text-sm text-destructive">{error}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="border-border" asChild>
            <Link href="/messages">Back to messages</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" className="border-border" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-e2">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <Link href="/messages">Back</Link>
          </Button>
          {other ? (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-9 w-9 shrink-0 border border-border">
                <AvatarImage src={other.avatarUrl ?? other.image ?? undefined} />
                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                  {(other.handle ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  @{other.handle}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {other.name ?? "Direct message"}
                </p>
              </div>
            </div>
          ) : (
            <p className="truncate text-sm font-semibold text-foreground">Conversation</p>
          )}
        </div>
      </div>

      <ContextualHelpCard
        context="product.messages"
        showIntro={false}
        maxPrimaryLinks={2}
        relatedLimit={1}
        className="rounded-none border-x-0 border-t-0 border-b border-border/80 bg-muted/10 py-3 shadow-none md:px-4"
      />

      {conversation?.auction ? (
        <div className="shrink-0 border-b border-border bg-muted/25 px-4 py-3">
          <Link
            href={`/auctions/${conversation.auction.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-e1 transition-colors hover:border-primary/25 hover:bg-muted/30"
          >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {conversation.auction.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- listing thumbs vary by host; keep lightweight
                <img
                  src={conversation.auction.images[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  No photo
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-snug text-foreground">
                {conversation.auction.title}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {conversation.auction.year} {conversation.auction.make}{" "}
                {conversation.auction.model}
                {conversation.auction.trim ? ` ${conversation.auction.trim}` : ""}
                <span className="text-muted-foreground/80"> · </span>
                <span className="font-medium text-foreground/90">
                  {conversation.auction.status}
                </span>
              </p>
              <p className="mt-1 text-xs font-medium text-primary">View listing</p>
            </div>
          </Link>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto bg-background/50 px-4 py-4"
      >
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === viewerId;
            if (m.isSystem) {
              return (
                <div key={m.id} className="flex justify-center">
                  <p className="max-w-[min(90%,32rem)] rounded-full border border-border bg-muted/60 px-3 py-1.5 text-center text-[11px] leading-relaxed text-muted-foreground shadow-e1">
                    {m.body}
                  </p>
                </div>
              );
            }
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[min(85%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-e1",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-card-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1.5 text-[10px]",
                      mine ? "text-primary-foreground/75" : "text-muted-foreground"
                    )}
                  >
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card p-3">
        {reviewMode ? (
          <p className="mb-3 rounded-md border border-caution/30 bg-caution-soft/40 px-3 py-2 text-xs text-caution-foreground">
            Review mode: sending is disabled. Scroll and layout are for visual review
            only.
          </p>
        ) : null}
        {error && conversation ? (
          <p className="mb-2 text-xs font-medium text-destructive" role="status">
            {error}
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            className="resize-none border-border bg-background text-sm text-foreground"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            disabled={reviewMode}
          />
          <Button
            type="button"
            disabled={reviewMode || sending || body.trim().length === 0}
            onClick={() => void send()}
            className="shrink-0"
          >
            {sending ? <InlineSpinner label="Sending" /> : "Send"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Keep it respectful. Blocking prevents new messages from that participant.
        </p>
      </div>
    </div>
  );
}
