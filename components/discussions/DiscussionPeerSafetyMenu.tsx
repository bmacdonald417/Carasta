"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function DiscussionPeerSafetyMenu({
  targetUserId,
  targetHandle,
  initialBlocked,
  initialMuted,
}: {
  targetUserId: string;
  targetHandle: string;
  initialBlocked: boolean;
  initialMuted: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [muted, setMuted] = useState(initialMuted);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBlocked(initialBlocked);
    setMuted(initialMuted);
  }, [initialBlocked, initialMuted]);

  async function toggleBlock(next: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/user/block", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      if (!res.ok) return;
      setBlocked(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleMute(next: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/user/mute", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mutedUserId: targetUserId }),
      });
      if (!res.ok) return;
      setMuted(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        disabled={busy}
        onClick={() => void toggleBlock(!blocked)}
      >
        {blocked ? "Unblock" : "Block"} @{targetHandle}
      </Button>
      <span className="text-[10px] text-neutral-600">·</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        disabled={busy}
        onClick={() => void toggleMute(!muted)}
      >
        {muted ? "Unmute" : "Mute"} @{targetHandle}
      </Button>
    </div>
  );
}
