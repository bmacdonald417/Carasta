"use client";

import { useEffect } from "react";

/**
 * Smooth-scrolls to a section by id once (e.g. after landing with ?presetId=…).
 */
export function ScrollMarketingSectionIntoView({
  elementId,
  active,
}: {
  elementId: string;
  active: boolean;
}) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
    return () => window.clearTimeout(t);
  }, [elementId, active]);
  return null;
}
