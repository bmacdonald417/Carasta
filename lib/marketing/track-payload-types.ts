export type MarketingTrackPayload = {
  auctionId: string;
  eventType: "VIEW" | "SHARE_CLICK" | "BID_CLICK";
  metadata?: {
    path?: string;
    referrer?: string;
    shareTarget?: string;
    currentUrl?: string;
    visitorKey?: string;
    /** Bid-intent surface only; low-cardinality tokens from client */
    bidUiSurface?: string;
  };
  visitorKey?: string;
};
