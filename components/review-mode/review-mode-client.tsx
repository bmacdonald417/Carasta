"use client";

export function isReviewModeClient() {
  return process.env.NEXT_PUBLIC_REVIEW_MODE_ENABLED === "true";
}
