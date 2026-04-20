"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

type Props = {
  handle: string;
  presetId: string;
  /** Optional: full example URL to a listing marketing page with this preset applied. */
  exampleAuctionId?: string | null;
};

/**
 * Copies a ready-to-share URL or query snippet for Share & Promote deep linking.
 */
export function MarketingPresetQueryCopy({ handle, presetId, exampleAuctionId }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  const copy = useCallback(
    async (mode: "full" | "query") => {
      setMsg(null);
      try {
        const origin =
          typeof window !== "undefined" && window.location?.origin
            ? window.location.origin
            : "";
        const text =
          mode === "full" && exampleAuctionId
            ? `${origin}/u/${handle}/marketing/auctions/${exampleAuctionId}?presetId=${encodeURIComponent(presetId)}`
            : `?presetId=${encodeURIComponent(presetId)}`;
        await navigator.clipboard.writeText(text);
        setMsg(mode === "full" ? "Listing link copied." : "Query copied.");
        window.setTimeout(() => setMsg(null), 2500);
      } catch {
        setMsg("Could not copy.");
      }
    },
    [exampleAuctionId, handle, presetId]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {exampleAuctionId ? (
        <Button type="button" variant="secondary" size="sm" onClick={() => void copy("full")}>
          <Link2 className="mr-1.5 h-3.5 w-3.5" />
          Copy listing link
        </Button>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={() => void copy("query")}>
        Copy ?presetId=…
      </Button>
      {msg ? <span className="text-xs text-neutral-500">{msg}</span> : null}
    </div>
  );
}
