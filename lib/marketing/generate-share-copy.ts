import { formatCurrency } from "@/lib/utils";
import type { MarketingLinkKit } from "@/lib/marketing/build-marketing-links";

export type SellerShareCopyPack = {
  shortCaption: string;
  longCaption: string;
  endingSoonCaption: string;
  emailSubject: string;
  emailBody: string;
  hashtagsLine: string;
  keywordsLine: string;
};

export type SellerShareAuctionInput = {
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  status: string;
  endAt: Date;
  highBidCents: number;
};

function vehicleLine(a: SellerShareAuctionInput): string {
  const t = a.trim?.trim();
  return [a.year, a.make, a.model, t].filter(Boolean).join(" ");
}

function formatEnd(a: SellerShareAuctionInput): string {
  return a.endAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export type SellerShareCopyLinkOptions = {
  /** URL in short / long / ending-soon captions (defaults to `links.default`). */
  captionBaseUrl?: string;
  /** URL in the email body block (defaults to `links.email`). */
  emailBodyUrl?: string;
};

/**
 * Deterministic seller-safe copy. Uses only passed auction fields + URLs.
 */
export function generateSellerShareCopy(
  auction: SellerShareAuctionInput,
  links: MarketingLinkKit,
  options?: SellerShareCopyLinkOptions
): SellerShareCopyPack {
  const vehicle = vehicleLine(auction);
  const primaryUrl = options?.captionBaseUrl ?? links.default;
  const emailLinkUrl = options?.emailBodyUrl ?? links.email;
  const mileageBit =
    auction.mileage != null
      ? `Showing ${auction.mileage.toLocaleString()} miles. `
      : "";

  const bidBit =
    auction.status === "LIVE" && auction.highBidCents > 0
      ? `Current high bid ${formatCurrency(auction.highBidCents)}. `
      : auction.status === "LIVE"
        ? "Bidding is live. "
        : "";

  const shortCaption = `${vehicle} — live on Carasta. ${primaryUrl}`;

  const longCaption = `${auction.title}\n\n${vehicle}\n${mileageBit}${bidBit}See photos and place a bid on Carasta:\n${primaryUrl}\n\nEnds ${formatEnd(auction)}.`;

  const endingSoonCaption = `Ending soon — ${vehicle} on Carasta. ${bidBit}Bid before the clock runs out:\n${primaryUrl}\n\nEnds ${formatEnd(auction)}.`;

  const emailSubject = `${vehicle} | Now on Carasta`;

  const emailBody = `Hi,

I’m listing ${vehicle} on Carasta — a curated platform for enthusiast cars.

${mileageBit.trim()}${bidBit.trim()}

View the auction here:
${emailLinkUrl}

Ends: ${formatEnd(auction)}

Thanks for looking — happy to answer questions.

—`;

  const tags = [
    "Carasta",
    "CarAuction",
    sanitizeTag(auction.make),
    sanitizeTag(auction.model),
    "CollectorCar",
    "ClassicCars",
  ].filter((x): x is string => !!x && x.length > 1);

  const hashtagsLine = tags.map((t) => `#${t}`).join(" ");

  const keywordsLine = [auction.make, auction.model, String(auction.year), "auction", "Carasta"]
    .filter(Boolean)
    .join(", ");

  return {
    shortCaption,
    longCaption,
    endingSoonCaption,
    emailSubject,
    emailBody,
    hashtagsLine,
    keywordsLine,
  };
}

function sanitizeTag(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, "");
}
