/**
 * Carmunity by Carasta — design token mirror for documentation and TS consumers.
 * Runtime styling uses `styles/carmunity-tokens.css` + Tailwind theme extensions.
 */
export const designTokens = {
  colors: {
    /** Primary brand accent — align web + Flutter */
    brandCopperHex: "#E8A54B",
    /** Auction / bid / live urgency — not for general UI chrome */
    auctionSignalHex: "#FF3B5C",
    reserveEmeraldHex: "#10B981",
    backgroundApproxHex: "#07080C",
    surfaceCardApproxHex: "#12141A",
  },
  roles: {
    brand: "Copper — nav selection, links, focus rings, Carmunity chrome.",
    signalBid:
      "Performance red — live lots, high bid, countdown urgency, bid CTAs.",
  },
} as const;
