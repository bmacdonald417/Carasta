/**
 * In-app seller marketing alerts (`Notification.type` + JSON `payloadJson`).
 * Prefix keeps them distinct from other notification families.
 */
export const MARKETING_NOTIFICATION_PREFIX = "MARKETING_" as const;

export const MarketingNotificationType = {
  ENDING_SOON_HIGH_INTEREST: `${MARKETING_NOTIFICATION_PREFIX}ENDING_SOON_HIGH_INTEREST`,
  ENDING_SOON_LOW_INTEREST: `${MARKETING_NOTIFICATION_PREFIX}ENDING_SOON_LOW_INTEREST`,
  BID_CLICK_SURGE: `${MARKETING_NOTIFICATION_PREFIX}BID_CLICK_SURGE`,
  CAMPAIGN_START: `${MARKETING_NOTIFICATION_PREFIX}CAMPAIGN_START`,
  NO_RECENT_ACTIVITY: `${MARKETING_NOTIFICATION_PREFIX}NO_RECENT_ACTIVITY`,
} as const;

export type MarketingNotificationPayload = {
  title: string;
  /** Public listing id (optional deep link fallback). */
  auctionId?: string;
  campaignId?: string;
  /** Preferred link for seller marketing surfaces. */
  marketingHref?: string;
};
