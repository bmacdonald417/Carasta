import Pusher from "pusher";

const pusher =
  process.env.PUSHER_APP_ID && process.env.PUSHER_SECRET
    ? new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER ?? "us2",
        useTLS: true,
      })
    : null;

export function getPusher() {
  return pusher;
}

export function broadcastBidUpdate(auctionId: string, data: {
  highBidCents: number;
  highBidderHandle: string | null;
  bidCount: number;
  reserveMeterPercent: number | null;
  status: string;
  endAt: string;
  buyNowPriceCents?: number | null;
  buyNowExpiresAt?: string | null;
}) {
  if (!pusher) return;
  pusher.trigger(`auction-${auctionId}`, "bid-update", data);
}

import type { ActivityEvent } from "./activity-types";
export type { ActivityEvent };

const THROTTLE_MS = 4000;
const ENDING_SOON_THROTTLE_MS = 5 * 60 * 1000;
const lastEventByKey = new Map<string, number>();

function shouldThrottle(key: string, throttleMs: number): boolean {
  const now = Date.now();
  const last = lastEventByKey.get(key) ?? 0;
  if (now - last < throttleMs) return true;
  lastEventByKey.set(key, now);
  return false;
}

/** Broadcast to activity feed. Throttled. No private user info. */
export function broadcastActivityEvent(event: ActivityEvent): void {
  const key = event.type === "new_comment" ? `comment:${event.postId}` : `${event.type}:${event.auctionId}`;
  const throttleMs = event.type === "ending_soon" ? ENDING_SOON_THROTTLE_MS : THROTTLE_MS;
  if (shouldThrottle(key, throttleMs)) return;

  if (pusher) {
    pusher.trigger("activity-feed", "activity", event);
  }
  sseActivityBuffer.push(event);
  if (sseActivityBuffer.length > 50) sseActivityBuffer.shift();
  require("./activity-emitter").emitActivity(event);
}

/** In-memory buffer for SSE fallback when Pusher not configured. */
export const sseActivityBuffer: ActivityEvent[] = [];
