"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { ListingAiRewriteFieldBody } from "@/lib/validations/listing-ai";
import { updateDraftListingCopy } from "@/lib/listings/update-draft-listing-copy";
import { useRouter } from "next/navigation";

export type ListingAiRewriteContext = Pick<
  ListingAiRewriteFieldBody,
  | "year"
  | "make"
  | "model"
  | "trim"
  | "mileage"
  | "vin"
  | "title"
  | "description"
  | "conditionSummary"
  | "conditionGrade"
  | "audiencePreset"
  | "ownershipDuration"
  | "serviceHistoryConfidence"
  | "modifications"
  | "originality"
  | "documentationAvailable"
  | "sellingReason"
>;

type Field = "title" | "description" | "conditionSummary";

export function ListingAiFieldImprove({
  enabled,
  field,
  auctionId,
  context,
  listingStatus,
  currentText,
  onReplace,
}: {
  enabled: boolean;
  field: Field;
  /** When set, server loads canonical listing fields; rewrites use DB current value for this field. */
  auctionId?: string | null;
  /** Required when auctionId is absent (sell wizard). */
  context?: ListingAiRewriteContext;
  /** When set with auctionId, draft rows persist via server action; others copy to clipboard. */
  listingStatus?: string;
  currentText: string;
  /** Local wizard apply (no server). */
  onReplace?: (text: string) => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    if (!enabled) return;
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        field,
        currentText,
        instruction:
          field === "title"
            ? "Tighten this title, keep it factual, and make it scan-friendly."
            : field === "conditionSummary"
              ? "Make this more disclosure-forward, clearer, and easier to scan without sounding certain about unknowns."
              : "Improve scanability, disclosure clarity, and buyer trust while keeping unknowns explicit.",
        ...(auctionId ? { auctionId } : {}),
      };
      if (!auctionId && context) {
        Object.assign(body, {
          year: context.year,
          make: context.make,
          model: context.model,
          trim: context.trim ?? undefined,
          mileage: context.mileage ?? undefined,
          vin: context.vin ?? undefined,
          title: context.title,
          description: context.description,
          conditionSummary: context.conditionSummary,
          conditionGrade: context.conditionGrade ?? undefined,
          audiencePreset: context.audiencePreset ?? undefined,
          ownershipDuration: context.ownershipDuration ?? undefined,
          serviceHistoryConfidence: context.serviceHistoryConfidence ?? undefined,
          modifications: context.modifications ?? undefined,
          originality: context.originality ?? undefined,
          documentationAvailable: context.documentationAvailable ?? undefined,
          sellingReason: context.sellingReason ?? undefined,
        });
      }
      const res = await fetch("/api/listings/ai/rewrite-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { text?: string; message?: string };
      if (!res.ok) throw new Error(j.message ?? "Rewrite failed.");
      if (typeof j.text !== "string") throw new Error("Missing text.");

      if (onReplace) {
        onReplace(j.text);
        toast({ title: "Field updated" });
        return;
      }

      if (auctionId && listingStatus === "DRAFT") {
        const patch: {
          auctionId: string;
          title?: string;
          description?: string | null;
          conditionSummary?: string | null;
        } = { auctionId };
        if (field === "title") patch.title = j.text;
        if (field === "description") patch.description = j.text;
        if (field === "conditionSummary") patch.conditionSummary = j.text;
        const up = await updateDraftListingCopy(patch);
        if (!up.ok) {
          toast({ title: up.error ?? "Could not save draft", variant: "destructive" });
          return;
        }
        toast({ title: "Saved to draft" });
        router.refresh();
        return;
      }

      if (auctionId && listingStatus && listingStatus !== "DRAFT") {
        try {
          await navigator.clipboard.writeText(j.text);
          toast({
            title: "Copied improved text",
            description: "Live listings cannot be auto-saved from here yet.",
          });
        } catch {
          toast({ title: "Improvement ready", description: j.text.slice(0, 200) + "…" });
        }
      }
    } catch (e) {
      toast({
        title: "Improve failed",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }, [
    auctionId,
    context,
    currentText,
    enabled,
    field,
    listingStatus,
    onReplace,
    router,
    toast,
  ]);

  if (!enabled) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 shrink-0 text-xs text-primary hover:text-primary/90"
      disabled={busy}
      onClick={() => void run()}
    >
      {busy ? (
        <>
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          Improving…
        </>
      ) : (
        "Improve"
      )}
    </Button>
  );
}
