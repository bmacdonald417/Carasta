export type MarketingTrackPayload = {
  auctionId: string;
  eventType: "VIEW" | "SHARE_CLICK" | "BID_CLICK" | "EXTERNAL_REFERRAL";
  metadata?: {
    path?: string;
    referrer?: string;
    shareTarget?: string;
    currentUrl?: string;
    /** Bid-intent surface only; low-cardinality tokens from client */
    bidUiSurface?: string;
  };
  /** Server normalizes; do not put a duplicate in `metadata`. */
  visitorKey?: string;
};
