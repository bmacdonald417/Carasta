"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, MessageSquare, Clock } from "lucide-react";
import type { ActivityEvent } from "@/lib/activity-types";

const MAX_EVENTS = 15;

function EventIcon({ type }: { type: ActivityEvent["type"] }) {
  switch (type) {
    case "new_bid":
      return <Gavel className="h-3.5 w-3.5 text-primary" />;
    case "new_comment":
      return <MessageSquare className="h-3.5 w-3.5 text-sky-600" />;
    case "ending_soon":
      return <Clock className="h-3.5 w-3.5 text-amber-600" />;
    default:
      return <Gavel className="h-3.5 w-3.5 text-neutral-500" />;
  }
}

function EventLabel({ event }: { event: ActivityEvent }) {
  switch (event.type) {
    case "new_bid":
      return "New bid";
    case "new_comment":
      return "Comment";
    case "ending_soon":
      return "Ending soon";
    default:
      return "Activity";
  }
}

function EventLink({ event }: { event: ActivityEvent }) {
  const href = event.type === "new_comment" ? `/explore/post/${event.postId}` : `/auctions/${event.auctionId}`;
  const title = event.type === "new_comment" ? event.label : event.auctionTitle;
  return (
    <Link
      href={href}
      className="line-clamp-1 text-sm text-neutral-800 transition-colors hover:text-primary"
    >
      {title}
    </Link>
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

export function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  const addEvent = useCallback((event: ActivityEvent) => {
    setEvents((prev) => {
      const withId = { ...event, _id: `ev-${Date.now()}-${Math.random().toString(36).slice(2)}` };
      const next = [withId, ...prev].slice(0, MAX_EVENTS);
      return next;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    fetch("/api/activity-feed/events")
      .then((r) => r.ok ? r.json() : [])
      .then((data: ActivityEvent[]) => {
        const withIds = data.slice(0, MAX_EVENTS).map((e, i) => ({
          ...e,
          _id: `init-${i}-${e.timestamp}`,
        }));
        setEvents((prev) => (prev.length === 0 ? withIds : prev));
      })
      .catch(() => {});
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (key) {
      const Pusher = require("pusher-js");
      const pusher = new Pusher(key, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "us2",
      });
      const channel = pusher.subscribe("activity-feed");
      channel.bind("activity", addEvent);
      return () => {
        channel.unbind_all();
        pusher.unsubscribe("activity-feed");
      };
    }

    const es = new EventSource("/api/activity-feed");
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as ActivityEvent;
        addEvent(event);
      } catch (_) {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [mounted, addEvent]);

  return (
    <div className="rounded-[1.75rem] border border-neutral-200 bg-white py-4 shadow-sm">
      <h3 className="px-4 font-display text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Live Activity
      </h3>
      <div className="mt-3 max-h-[280px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-500">
            No recent activity yet.
          </p>
        ) : (
          <ul className="space-y-0">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                <motion.li
                  key={(event as ActivityEvent & { _id?: string })._id ?? `${event.type}-${event.timestamp}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 border-b border-neutral-100 px-4 py-2.5 last:border-0 hover:bg-neutral-50"
                >
                  <EventIcon type={event.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500">
                      <EventLabel event={event} />
                    </p>
                    <EventLink event={event} />
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
