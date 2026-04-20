"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DiscussionThreadSaveButton({
  threadId,
  initialSaved,
  showNewActivityDot = false,
}: {
  threadId: string;
  initialSaved: boolean;
  /** Shown when the thread had activity after the user’s last “seen” time for this save (Phase J). */
  showNewActivityDot?: boolean;
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
      className="relative border-primary/35 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
      disabled={busy}
      onClick={() => void toggle()}
    >
      {saved ? "Saved" : "Save thread"}
      {saved && showNewActivityDot ? (
        <span
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/40"
          title="New activity since you last opened this thread"
          aria-hidden
        />
      ) : null}
    </Button>
  );
}
