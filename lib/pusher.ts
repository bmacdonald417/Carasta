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
