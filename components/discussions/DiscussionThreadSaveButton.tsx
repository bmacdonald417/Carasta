"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

import { LoadingButton } from "@/components/ui/loading-button";
import { useGuestGate } from "@/components/guest-gate/GuestGateProvider";

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
  const { data: session } = useSession();
  const { openGate } = useGuestGate();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!session?.user) {
      openGate({ intent: "save" });
      return;
    }
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
    <LoadingButton
      type="button"
      variant="outline"
      size="sm"
      className="relative border-primary/35 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
      loading={busy}
      loadingLabel={saved ? "Saving…" : "Saving…"}
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
    </LoadingButton>
  );
}
