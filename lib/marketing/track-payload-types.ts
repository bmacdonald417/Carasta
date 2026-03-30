export type MarketingTrackPayload = {
  auctionId: string;
  eventType: "VIEW" | "SHARE_CLICK";
  metadata?: {
    path?: string;
    referrer?: string;
    shareTarget?: string;
    currentUrl?: string;
    visitorKey?: string;
  };
  visitorKey?: string;
};
