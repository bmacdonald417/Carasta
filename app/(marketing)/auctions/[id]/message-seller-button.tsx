"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageSellerButton(props: {
  auctionId: string;
  sellerId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: props.sellerId, auctionId: props.auctionId }),
      });
      const j = (await res.json()) as { ok?: boolean; conversationId?: string; error?: string };
      if (!res.ok || !j.ok || !j.conversationId) {
        throw new Error(j.error ?? "Could not start conversation.");
      }
      router.push(`/messages/${j.conversationId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start conversation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-primary/35 text-primary hover:bg-primary/10"
        disabled={props.disabled || loading}
        onClick={() => void start()}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
        Message Seller
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

