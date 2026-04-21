"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListingAiAssistant, type ListingAiApplyPatch } from "@/components/sell/listing-ai-assistant";
import { ListingAiFieldImprove } from "@/components/sell/listing-ai-field-improve";
import { ListingAiRunHistory } from "@/components/sell/listing-ai-run-history";
import { updateDraftListingCopy } from "@/lib/listings/update-draft-listing-copy";
import { useToast } from "@/components/ui/use-toast";

export type ListingRowForAi = {
  id: string;
  status: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  vin: string | null;
  description: string | null;
  conditionSummary: string | null;
  conditionGrade: string | null;
};

export function ListingsAiRefineDialog({
  listingAiEnabled,
  row,
}: {
  listingAiEnabled: boolean;
  row: ListingRowForAi;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    if (open) setHistoryTick((t) => t + 1);
  }, [open]);

  const handleApply = useCallback(
    async (patch: ListingAiApplyPatch) => {
      const next = {
        title: patch.title ?? row.title,
        description: patch.description ?? row.description ?? "",
        conditionSummary: patch.conditionSummary ?? row.conditionSummary ?? "",
      };

      if (row.status !== "DRAFT") {
        const blob = `Title:\n${next.title}\n\nDescription:\n${next.description}\n\nCondition summary:\n${next.conditionSummary}`;
        try {
          await navigator.clipboard.writeText(blob);
          toast({
            title: "Copied to clipboard",
            description: "Draft listings can apply directly; live listings are copy-only for now.",
          });
        } catch {
          toast({
            title: "Could not copy",
            description: "Select and copy from the preview manually.",
            variant: "destructive",
          });
        }
        setOpen(false);
        return;
      }

      const res = await updateDraftListingCopy({
        auctionId: row.id,
        title: next.title,
        description: next.description,
        conditionSummary: next.conditionSummary || null,
      });
      if (!res.ok) {
        toast({ title: res.error ?? "Update failed", variant: "destructive" });
        return;
      }
      toast({ title: "Draft updated" });
      setOpen(false);
      router.refresh();
    },
    [row, toast, router]
  );

  if (!listingAiEnabled) return null;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Refine copy (AI)
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#0c0d12] text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display">Refine listing copy</DialogTitle>
            <DialogDescription className="text-neutral-400">
              {row.year} {row.make} {row.model}
              {row.trim ? ` ${row.trim}` : ""} ·{" "}
              <span className="text-neutral-300">{row.status}</span>
              {row.status !== "DRAFT" ? (
                <span className="block pt-2 text-amber-200/90">
                  Apply saves to the database for <strong>drafts</strong> only. For live listings,
                  Apply copies everything to your clipboard.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Quick improve
            </span>
            <ListingAiFieldImprove
              enabled
              field="title"
              auctionId={row.id}
              listingStatus={row.status}
              currentText={row.title}
            />
            <ListingAiFieldImprove
              enabled
              field="description"
              auctionId={row.id}
              listingStatus={row.status}
              currentText={row.description ?? ""}
            />
            <ListingAiFieldImprove
              enabled
              field="conditionSummary"
              auctionId={row.id}
              listingStatus={row.status}
              currentText={row.conditionSummary ?? ""}
            />
          </div>
          <ListingAiAssistant
            enabled
            scope="full"
            auctionId={row.id}
            intake={{
              year: row.year,
              make: row.make,
              model: row.model,
              trim: row.trim ?? "",
              mileage: row.mileage ?? "",
              vin: row.vin ?? "",
              title: row.title,
              description: row.description ?? "",
              conditionSummary: row.conditionSummary ?? "",
              conditionGrade: row.conditionGrade ?? undefined,
            }}
            onApply={(patch) => {
              void handleApply(patch);
            }}
          />
          <ListingAiRunHistory
            auctionId={row.id}
            active={open}
            refreshKey={historyTick}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
