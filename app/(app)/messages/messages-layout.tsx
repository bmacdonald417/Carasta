"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Paperclip,
  Search,
  Send,
  Smile,
  Phone,
  MoreHorizontal,
  CheckCheck,
  Pencil,
  MessageSquarePlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { shellFocusRing } from "@/lib/shell-nav-styles";

// ── Types ────────────────────────────────────────────────────────────────────

type UserMini = {
  id: string;
  handle: string;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
};

type ConversationRow = {
  id: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  otherParticipants: UserMini[];
  unreadCount: number;
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

type ConversationDetail = {
  id: string;
  auctionId?: string | null;
  participants: Array<{ user: UserMini }>;
  auction?: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    status: string;
    images: Array<{ url: string }>;
  } | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtListTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = diffMs / 60000;
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${Math.floor(diffMins)}m`;
  if (diffMins < 1440) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffMins < 10080) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function fmtMsgTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function displayOther(row: ConversationRow): string {
  const o = row.otherParticipants[0];
  if (!o) return "Conversation";
  return o.name?.trim() || `@${o.handle}`;
}

const EMOJI_QUICK = ["👍", "❤️", "😂", "🔥", "🏎️", "🔧", "🙌", "😎", "👀", "✅"];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ConvSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-muted/60 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-muted/50 animate-pulse" />
            <div className="h-3 w-44 max-w-full rounded bg-muted/40 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Conversation list item ────────────────────────────────────────────────────

function ConvItem({
  row,
  active,
  onClick,
}: {
  row: ConversationRow;
  active: boolean;
  onClick: () => void;
}) {
  const other = row.otherParticipants[0];
  const avatar = other?.avatarUrl ?? other?.image ?? undefined;
  const name = displayOther(row);
  const unread = row.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border/40 px-4 py-3.5 text-left transition-colors",
        active
          ? "bg-primary/10 border-l-2 border-l-primary"
          : "hover:bg-muted/40",
        shellFocusRing
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 border border-border/60">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {(other?.handle ?? "C").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Online dot placeholder */}
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn("truncate text-sm", unread ? "font-bold text-foreground" : "font-medium text-foreground")}>
            {name}
          </p>
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {fmtListTime(row.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn("truncate text-xs", unread ? "text-foreground/80 font-medium" : "text-muted-foreground")}>
            {row.lastMessagePreview ?? "No messages yet"}
          </p>
          {unread && (
            <span className="shrink-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1.5 min-w-[18px]">
              {row.unreadCount > 99 ? "99+" : row.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MsgBubble({ msg, mine, other }: { msg: MessageRow; mine: boolean; other: UserMini | null }) {
  if (msg.isSystem) {
    return (
      <div className="flex justify-center py-1">
        <p className="rounded-full border border-border bg-muted/60 px-4 py-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
          {msg.body}
        </p>
      </div>
    );
  }

  // Render markdown-style bold/newlines
  const rendered = msg.body.split("\n").map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ));

  return (
    <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && (
        <Avatar className="h-7 w-7 shrink-0 border border-border/60 mb-0.5">
          <AvatarImage src={other?.avatarUrl ?? other?.image ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
            {(other?.handle ?? "C").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("group max-w-[min(75%,28rem)]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
            mine
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border border-border/60 bg-card text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap">{rendered}</p>
        </div>
        <div className={cn("mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", mine ? "justify-end" : "justify-start")}>
          <span>{fmtMsgTime(msg.createdAt)}</span>
          {mine && <CheckCheck className="h-3 w-3 text-primary/60" />}
        </div>
      </div>
    </div>
  );
}

// ── Empty inbox state ─────────────────────────────────────────────────────────

function EmptyInbox() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/30 shadow-sm">
        <MessageSquarePlus className="h-8 w-8 text-primary/60" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">No messages yet</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Start a conversation from someone&apos;s profile or a listing. Your inbox will appear here.
      </p>
      <Button asChild size="sm" className="mt-5 rounded-full px-5">
        <Link href="/explore">Browse Carmunity</Link>
      </Button>
    </div>
  );
}

// ── No convo selected ─────────────────────────────────────────────────────────

function NoConvoSelected() {
  return (
    <div className="hidden flex-1 flex-col items-center justify-center bg-muted/10 md:flex">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <MessageSquarePlus className="h-10 w-10 text-primary/60" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">Your messages</h2>
      <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
        Select a conversation to read and reply, or start one from any profile.
      </p>
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────

export function MessagesLayout({
  viewerId,
  viewerHandle,
  viewerName,
  viewerAvatar,
  initialWithHandle,
}: {
  viewerId: string;
  viewerHandle: string | null;
  viewerName: string | null;
  viewerAvatar: string | null;
  initialWithHandle: string | null;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmoji]);

  const sortedConvs = useMemo(() => {
    return [...conversations]
      .sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return tb - ta;
      })
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const other = c.otherParticipants[0];
        return (
          (other?.handle?.toLowerCase().includes(q)) ||
          (other?.name?.toLowerCase().includes(q)) ||
          (c.lastMessagePreview?.toLowerCase().includes(q))
        );
      });
  }, [conversations, search]);

  const other = useMemo(() => {
    if (!detail) return null;
    return detail.participants.map((p) => p.user).find((u) => u.id !== viewerId) ?? null;
  }, [detail, viewerId]);

  // Load conversation list
  const loadConvs = useCallback(async () => {
    setConvsLoading(true);
    try {
      const res = await fetch("/api/messages/conversations");
      const j = await res.json() as { ok?: boolean; conversations?: ConversationRow[] };
      if (j.ok) setConversations(j.conversations ?? []);
    } finally {
      setConvsLoading(false);
    }
  }, []);

  useEffect(() => { void loadConvs(); }, [loadConvs]);

  // If ?with= param, start or find a conversation with that user
  useEffect(() => {
    if (!initialWithHandle || convsLoading) return;
    // Check if a conv already exists
    const existing = conversations.find((c) =>
      c.otherParticipants.some((u) => u.handle === initialWithHandle)
    );
    if (existing) {
      void openConversation(existing.id);
      router.replace("/messages", { scroll: false });
    }
    // else we show the new message button — user can start from profile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWithHandle, convsLoading]);

  // Open a conversation
  const openConversation = useCallback(async (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setDetail(null);
    setMessages([]);
    setMsgError(null);
    setMsgLoading(true);
    try {
      const res = await fetch(`/api/messages/conversations/${encodeURIComponent(id)}?limit=80`);
      const j = await res.json() as {
        ok?: boolean;
        conversation?: ConversationDetail;
        messages?: MessageRow[];
      };
      if (j.ok) {
        setDetail(j.conversation ?? null);
        setMessages((j.messages ?? []).slice().reverse());
        // Mark read
        void fetch(`/api/messages/conversations/${encodeURIComponent(id)}/read`, { method: "PATCH" });
        // Update unread in list
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        );
      }
    } finally {
      setMsgLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" });
      }, 50);
    }
  }, [activeId]);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 30);
  }, [messages.length]);

  async function send() {
    if (!activeId || sending || !body.trim()) return;
    setSending(true);
    setMsgError(null);
    const trimmed = body.trim();
    setBody("");
    try {
      const res = await fetch(`/api/messages/conversations/${encodeURIComponent(activeId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const j = await res.json() as { ok?: boolean; message?: MessageRow; error?: string };
      if (j.ok && j.message) {
        setMessages((prev) => [...prev, j.message!]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessageAt: j.message!.createdAt,
                  lastMessagePreview: trimmed.length > 60 ? trimmed.slice(0, 59) + "…" : trimmed,
                }
              : c
          )
        );
      } else {
        setMsgError(j.error ?? "Failed to send.");
        setBody(trimmed);
      }
    } catch {
      setMsgError("Failed to send.");
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

  function appendEmoji(emoji: string) {
    setBody((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  const isMobileConvOpen = Boolean(activeId);

  return (
    <div className="flex h-[calc(100dvh-3.75rem)] overflow-hidden bg-background">
      {/* ── Sidebar: Conversation list ─────────────────────────── */}
      <div
        className={cn(
          "flex w-full shrink-0 flex-col border-r border-border bg-card md:w-[340px] lg:w-[380px]",
          isMobileConvOpen && "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-[hsl(var(--navy))] px-4 py-3.5">
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Messages</h1>
            <p className="text-[11px] text-white/60">Carmunity direct messages</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            asChild
            title="New message"
          >
            <Link href="/explore">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-border/50 px-3 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-border/60 bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {convsLoading ? (
            <ConvSkeleton />
          ) : sortedConvs.length === 0 ? (
            <EmptyInbox />
          ) : (
            sortedConvs.map((c) => (
              <ConvItem
                key={c.id}
                row={c}
                active={c.id === activeId}
                onClick={() => void openConversation(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main panel: open conversation ─────────────────────── */}
      {activeId ? (
        <div className={cn("flex flex-1 flex-col overflow-hidden", !isMobileConvOpen && "hidden md:flex")}>
          {/* Conversation header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
            {/* Mobile back */}
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 md:hidden"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

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
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary" title="Voice call (coming soon)" disabled>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary" title="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Auction context strip */}
          {detail?.auction && (
            <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2.5">
              <Link
                href={`/auctions/${detail.auction.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition hover:border-primary/30 hover:bg-muted/30"
              >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {detail.auction.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={detail.auction.images[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">No photo</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{detail.auction.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {detail.auction.year} {detail.auction.make} {detail.auction.model} · <span className="font-medium text-primary">{detail.auction.status}</span>
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto bg-muted/5 px-4 py-4"
          >
            {msgLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => {
                  const mine = i % 2 === 0;
                  return (
                    <div key={i} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className="h-12 w-52 max-w-[70%] rounded-2xl bg-muted/40 animate-pulse" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-2">
                {messages.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Say hi! This is the start of your conversation with {other?.name?.trim() || `@${other?.handle}`}.
                  </p>
                )}
                {messages.map((m) => (
                  <MsgBubble key={m.id} msg={m} mine={m.senderId === viewerId} other={other} />
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-border bg-card px-3 py-3">
            {msgError && (
              <p className="mb-2 text-xs font-medium text-destructive" role="alert">{msgError}</p>
            )}
            <div className="flex items-end gap-2">
              {/* Toolbar */}
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
                      <div className="grid grid-cols-5 gap-1">
                        {EMOJI_QUICK.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => appendEmoji(e)}
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
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/60 hover:text-primary"
                  title="Attachment (coming soon)"
                  disabled
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>

              {/* Text input */}
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  rows={1}
                  className={cn(
                    "w-full resize-none rounded-2xl border border-border/70 bg-muted/30 px-4 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
                    "max-h-32 min-h-[2.5rem] transition-all"
                  )}
                  placeholder="Message…"
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    // Auto-grow
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
                  }}
                  onKeyDown={onKeyDown}
                />
              </div>

              {/* Send button */}
              <button
                type="button"
                disabled={sending || !body.trim()}
                onClick={() => void send()}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition",
                  body.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "bg-muted/40 text-muted-foreground"
                )}
                title="Send"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
              Press Enter to send · Shift+Enter for new line · Emoji 😊
            </p>
          </div>
        </div>
      ) : (
        <NoConvoSelected />
      )}
    </div>
  );
}
