"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import { ElementSelector } from "./ElementSelector";
import type { FeedbackCategory, PinnedElement } from "./types";
import { FLOATING_PILL_LAUNCHER_CLASS } from "@/components/shell/floating-launcher-styles";

export default function FeedbackWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [pinned, setPinned] = useState<PinnedElement | null>(null);

  const onSubmit = useCallback(
    async (payload: {
      content: string;
      category: FeedbackCategory;
      pinned: PinnedElement | null;
    }) => {
      const pageUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: payload.content,
          category: payload.category,
          pageUrl,
          elementSelector: payload.pinned?.selector,
          elementText: payload.pinned?.text,
          elementType: payload.pinned?.type,
          elementIdAttr: payload.pinned?.idAttr,
          elementClassAttr: payload.pinned?.classAttr,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(j?.error ?? `Request failed (${res.status})`);
      }
    },
    []
  );

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div data-feedback-widget-root className="pointer-events-none">
      <ElementSelector
        active={selecting}
        onCancel={() => setSelecting(false)}
        onPick={(p) => {
          setPinned(p);
          setSelecting(false);
          setOpen(true);
        }}
      />

      <button
        type="button"
        aria-label="Open feedback"
        onClick={() => setOpen(true)}
        className={`pointer-events-auto ${FLOATING_PILL_LAUNCHER_CLASS}`}
      >
        <MessageSquarePlus className="h-4 w-4 shrink-0 text-primary" />
        Feedback
      </button>

      <FeedbackModal
        open={open}
        onOpenChange={setOpen}
        pinned={pinned}
        onStartPin={() => {
          setOpen(false);
          setSelecting(true);
        }}
        onClearPin={() => setPinned(null)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
