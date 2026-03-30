"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteMarketingPreset } from "@/app/(app)/u/[handle]/marketing/presets/actions";

export function MarketingPresetDeleteButton({
  handle,
  presetId,
  variant = "ghost",
  redirectAfterDelete = false,
}: {
  handle: string;
  presetId: string;
  variant?: "ghost" | "outline" | "destructive";
  redirectAfterDelete?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (
      !confirm(
        "Delete this preset? Share & Promote will fall back to standard links for saved settings only."
      )
    ) {
      return;
    }
    setLoading(true);
    const r = await deleteMarketingPreset(handle, presetId);
    setLoading(false);
    if (r.ok) {
      toast({ title: "Preset deleted" });
      if (redirectAfterDelete) {
        router.push(`/u/${handle}/marketing/presets`);
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
