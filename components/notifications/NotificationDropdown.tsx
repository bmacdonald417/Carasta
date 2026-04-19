"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead } from "@/app/(app)/notifications/actions";

type NotificationItem = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

type NotificationCursor = { createdAt: string; id: string };

function parseNotificationListPayload(json: unknown): {
  items: NotificationItem[];
  nextCursor: NotificationCursor | null;
} {
  if (Array.isArray(json)) {
    return { items: json as NotificationItem[], nextCursor: null };
  }
  if (json && typeof json === "object") {
    const obj = json as { items?: unknown; nextCursor?: unknown };
    const items = Array.isArray(obj.items) ? (obj.items as NotificationItem[]) : [];
    const nc = obj.nextCursor;
    if (
      nc &&
      typeof nc === "object" &&
      typeof (nc as { createdAt?: unknown }).createdAt === "string" &&
      typeof (nc as { id?: unknown }).id === "string"
    ) {
      return {
        items,
        nextCursor: {
          createdAt: (nc as { createdAt: string }).createdAt,
          id: (nc as { id: string }).id,
        },
      };
    }
    return { items, nextCursor: null };
  }
  return { items: [], nextCursor: null };
}

export function NotificationDropdown() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<NotificationCursor | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetch("/api/notifications/unread-count"),
        fetch("/api/notifications?take=25"),
      ]);
      if (countRes.ok) {
        const { count } = await countRes.json();
        setUnreadCount(count);
      }
      if (listRes.ok) {
        const parsed = parseNotificationListPayload(await listRes.json());
        setItems(parsed.items);
        setNextCursor(parsed.nextCursor);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  async function handleMarkAllRead() {
    const result = await markAllNotificationsRead();
    if (result.ok) {
      setUnreadCount(0);
      setItems((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    }
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const qs = new URLSearchParams({
        take: "25",
        cursorCreatedAt: nextCursor.createdAt,
        cursorId: nextCursor.id,
      });
      const res = await fetch(`/api/notifications?${qs.toString()}`);
      if (!res.ok) return;
      const parsed = parseNotificationListPayload(await res.json());
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const n of parsed.items) {
          if (!seen.has(n.id)) merged.push(n);
        }
        return merged;
      });
      setNextCursor(parsed.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-neutral-400 hover:text-neutral-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-white/10 bg-[#121218]/95 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">
              No notifications yet.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-white/5">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`px-3 py-2.5 text-sm ${!n.readAt ? "bg-white/5" : ""}`}
                  >
                    <NotificationRow item={n} onNavigate={fetchData} />
                  </li>
                ))}
              </ul>
              {nextCursor ? (
                <div className="border-t border-white/5 p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-semibold uppercase tracking-wide text-primary hover:bg-white/5"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({
  item,
  onNavigate,
}: {
  item: NotificationItem;
  onNavigate: () => void;
}) {
  const payload = item.payload as {
    auctionId?: string;
    postId?: string;
    marketingHref?: string;
    href?: string;
  };
  const href = payload.href
    ? payload.href
    : payload.marketingHref
      ? payload.marketingHref
      : payload.auctionId
        ? `/auctions/${payload.auctionId}`
        : payload.postId
          ? `/explore/post/${payload.postId}`
          : null;
  const title =
    (item.payload as { title?: string }).title ??
    (item.payload as { message?: string }).message ??
    item.type;

  async function markRead() {
    if (item.readAt) return;
    try {
      await fetch(`/api/notifications/${encodeURIComponent(item.id)}/read`, {
        method: "PATCH",
      });
      onNavigate();
    } catch (_) {}
  }

  const content = (
    <span className="line-clamp-2 text-neutral-300">{title}</span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={() => {
          void markRead();
        }}
        className="block hover:text-neutral-100"
      >
        {content}
        <span className="mt-0.5 block text-xs text-neutral-500">
          {formatTime(item.createdAt)}
        </span>
      </Link>
    );
  }

  return (
    <div>
      {content}
      <span className="mt-0.5 block text-xs text-neutral-500">
        {formatTime(item.createdAt)}
      </span>
    </div>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}
