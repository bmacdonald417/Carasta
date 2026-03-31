"use client";

import { useEffect, useRef } from "react";
import {
  getOrCreateMarketingVisitorKey,
  sendMarketingTrack,
} from "@/lib/marketing/send-marketing-track";
import {
  sendMarketingTrackExternalReferralLanding,
  urlHasExternalMarketingAttributionParams,
} from "@/lib/marketing/track-external-referral-landing";

export function AuctionViewTracker({
  auctionId,
  enabled,
}: {
  auctionId: string;
  enabled: boolean;
}) {
  const sentRef = useRef(false);
  const externalReferralSentRef = useRef(false);

  useEffect(() => {
    if (!enabled || !auctionId || sentRef.current) return;
    sentRef.current = true;

    const vk = getOrCreateMarketingVisitorKey();
    sendMarketingTrack({
      auctionId,
      eventType: "VIEW",
      visitorKey: vk || undefined,
      metadata: {
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        referrer:
          typeof document !== "undefined" && document.referrer
            ? document.referrer
            : undefined,
        currentUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
      },
    });

    if (
      !externalReferralSentRef.current &&
      urlHasExternalMarketingAttributionParams()
    ) {
      externalReferralSentRef.current = true;
      sendMarketingTrackExternalReferralLanding({
        auctionId,
        visitorKey: vk || undefined,
      });
    }
  }, [auctionId, enabled]);

  return null;
}
