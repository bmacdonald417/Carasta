"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteMarketingCampaign } from "@/app/(app)/u/[handle]/marketing/campaigns/actions";

export function CampaignDeleteButton({
  handle,
  campaignId,
  variant = "ghost",
  redirectAfterDelete = false,
}: {
  handle: string;
  campaignId: string;
  variant?: "ghost" | "outline" | "destructive";
  /** When true, navigate to campaigns list after delete (e.g. from edit page). */
  redirectAfterDelete?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (
      !confirm(
        "Delete this campaign? This only removes the organizational record — it does not affect your listing or traffic data."
      )
    ) {
      return;
    }
    setLoading(true);
    const r = await deleteMarketingCampaign(handle, campaignId);
    setLoading(false);
    if (r.ok) {
      toast({ title: "Campaign deleted" });
      if (redirectAfterDelete) {
        router.push(`/u/${handle}/marketing/campaigns`);
      }
      router.refresh();
    } else {
      toast({ title: r.error, variant: "destructive" });
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className="text-neutral-400 hover:text-red-400"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? "…" : "Delete"}
    </Button>
  );
}
