"use client";

import { useEffect } from "react";

export default function AuctionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auctions error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-neutral-100">
        Something went wrong
      </h1>
      <p className="mt-2 text-muted-foreground">
        {error.message || "Failed to load auctions."}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Digest: {error.digest ?? "—"}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-[#00E5FF]/20 px-4 py-2 text-sm font-medium text-[#00E5FF] hover:bg-[#00E5FF]/30"
      >
        Try again
      </button>
    </div>
  );
}
