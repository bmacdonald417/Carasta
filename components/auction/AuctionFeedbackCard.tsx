"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitAuctionFeedback } from "@/app/(marketing)/auctions/actions";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  auctionId: string;
  counterpartyHandle: string;
  userRole: "buyer" | "seller";
  hasSubmitted?: boolean;
};

export function AuctionFeedbackCard({
  auctionId,
  counterpartyHandle,
  userRole,
  hasSubmitted = false,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(hasSubmitted);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function handleSubmit(rating: "POSITIVE" | "NEGATIVE") {
    setLoading(true);
    const formData = new FormData();
    formData.set("auctionId", auctionId);
    formData.set("rating", rating);
    if (note.trim()) formData.set("note", note.trim());
    const result = await submitAuctionFeedback(formData);
    setLoading(false);
    if (result.ok) {
      setSubmitted(true);
      router.refresh();
      toast({ title: "Thanks, your feedback has been submitted." });
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Thanks, submitted.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-4">
      <p className="text-sm font-medium">Leave feedback for @{counterpartyHandle}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        How was your experience {userRole === "buyer" ? "with the seller" : "with the buyer"}?
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500"
          disabled={loading}
          onClick={() => handleSubmit("POSITIVE")}
        >
          Positive
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
          disabled={loading}
          onClick={() => handleSubmit("NEGATIVE")}
        >
          Negative
        </Button>
      </div>
      <Textarea
        placeholder="Optional note (private)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        className="mt-2 min-h-[60px] resize-none text-sm"
        disabled={loading}
      />
    </div>
  );
}
