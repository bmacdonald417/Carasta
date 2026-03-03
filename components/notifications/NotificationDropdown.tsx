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

export function NotificationDropdown() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetch("/api/notifications/unread-count"),
        fetch("/api/notifications/list"),
      ]);
      if (countRes.ok) {
        const { count } = await countRes.json();
        setUnreadCount(count);
      }
      if (listRes.ok) {
        const list = await listRes.json();
        setItems(list);
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
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3b5c] px-1 text-[10px] font-bold text-white">
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
              className="text-xs text-[#ff3b5c] hover:underline"
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
            <ul className="divide-y divide-white/5">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`px-3 py-2.5 text-sm ${!n.readAt ? "bg-white/5" : ""}`}
                >
                  <NotificationRow item={n} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const href = (item.payload as { auctionId?: string; postId?: string }).auctionId
    ? `/auctions/${(item.payload as { auctionId: string }).auctionId}`
    : (item.payload as { postId?: string }).postId
      ? `/explore/post/${(item.payload as { postId: string }).postId}`
      : null;
  const title =
    (item.payload as { title?: string }).title ??
    (item.payload as { message?: string }).message ??
    item.type;

  const content = (
    <span className="line-clamp-2 text-neutral-300">{title}</span>
  );

  if (href) {
    return (
      <Link href={href} onClick={() => {}} className="block hover:text-neutral-100">
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
