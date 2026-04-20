"use client";

import { useEffect } from "react";

/**
 * When the URL hash matches, scrolls the element with `elementId` into view (smooth).
 */
export function HashScrollIntoView({
  elementId,
  hash,
}: {
  elementId: string;
  /** e.g. "#marketing-ai-copilot" */
  hash: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== hash) return;
    const el = document.getElementById(elementId);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [elementId, hash]);
  return null;
}
