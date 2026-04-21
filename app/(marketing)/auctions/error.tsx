"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="carasta-container max-w-6xl py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        {error.message || "Failed to load auctions."}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Digest: {error.digest ?? "—"}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  );
}
