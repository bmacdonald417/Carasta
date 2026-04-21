/**
 * Carmunity by Carasta — design token mirror for documentation and TS consumers.
 * Runtime styling uses `styles/carmunity-tokens.css` + Tailwind theme extensions.
 */
export const designTokens = {
  colors: {
    /** Heritage brand copper — not functional chrome on web after Phase 1A */
    brandCopperHex: "#E8A54B",
    /** Functional accent family anchor (HSL varies by light/dark mapping in CSS tokens) */
    accentBlueVioletApproxHex: "#6D5DF5",
    /** Auction / bid / live urgency — not for general UI chrome */
    auctionSignalHex: "#FF3B5C",
    reserveEmeraldHex: "#10B981",
    backgroundApproxHex: "#F6F7FB",
    surfaceCardApproxHex: "#FFFFFF",
  },
  roles: {
    brand: "Heritage copper — rare marketing/brand moments only (not product chrome).",
    accent:
      "Blue-violet — primary buttons, links, focus rings, active states (functional accent).",
    signalBid:
      "Performance red — live lots, high bid, countdown urgency, bid CTAs.",
  },
} as const;
