"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import { ElementSelector } from "./ElementSelector";
import type { FeedbackCategory, PinnedElement } from "./types";

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
        className="pointer-events-auto fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary/90 to-emerald-600/90 text-white shadow-xl shadow-black/40 transition hover:scale-[1.03] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <MessageSquarePlus className="h-7 w-7" />
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
