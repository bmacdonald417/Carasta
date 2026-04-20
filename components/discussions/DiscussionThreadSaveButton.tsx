"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DiscussionThreadSaveButton({
  threadId,
  initialSaved,
}: {
  threadId: string;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/discussions/threads/${encodeURIComponent(threadId)}/subscribe`,
        {
          method: saved ? "DELETE" : "POST",
        }
      );
      if (!res.ok) return;
      setSaved(!saved);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-primary/35 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
      disabled={busy}
      onClick={() => void toggle()}
    >
      {saved ? "Saved" : "Save thread"}
    </Button>
  );
}
