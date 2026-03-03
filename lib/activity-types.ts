/** Activity feed event types. Public-safe payloads only. */
export type ActivityEvent =
  | { type: "new_bid"; auctionId: string; auctionTitle: string; timestamp: string }
  | { type: "new_comment"; postId: string; label: string; timestamp: string }
  | { type: "ending_soon"; auctionId: string; auctionTitle: string; timestamp: string };
