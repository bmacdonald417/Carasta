"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FeedbackCategory, PinnedElement } from "./types";
import { Crosshair, Sparkles } from "lucide-react";

const categories: { id: FeedbackCategory; label: string }[] = [
  { id: "bug", label: "Bug" },
  { id: "ux", label: "UX" },
  { id: "feature", label: "Feature" },
  { id: "general", label: "General" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinned: PinnedElement | null;
  onStartPin: () => void;
  onClearPin: () => void;
  onSubmit: (payload: {
    content: string;
    category: FeedbackCategory;
    pinned: PinnedElement | null;
  }) => Promise<void>;
};

export default function FeedbackModal({
  open,
  onOpenChange,
  pinned,
  onStartPin,
  onClearPin,
  onSubmit,
}: Props) {
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setContent("");
      setCategory("general");
      setError(null);
    }
  }, [open]);

  async function handleSubmit() {
    setError(null);
    if (!content.trim()) {
      setError("Please describe what you noticed.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ content: content.trim(), category, pinned });
      setContent("");
      setCategory("general");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send feedback.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display tracking-wide">
            <Sparkles className="h-5 w-5 text-primary" />
            Send feedback
          </DialogTitle>
          <DialogDescription>
            Help improve Carmunity by Carasta — optionally pinpoint the exact
            element on the page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-2xl border px-3 py-1.5 text-sm transition ${
                    category === c.id
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-2xl border-white/15"
              onClick={onStartPin}
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Pin element
            </Button>
            {pinned ? (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                <span className="font-mono text-[11px] text-emerald-200/90">
                  {pinned.type}
                  {pinned.idAttr ? `#${pinned.idAttr}` : ""}
                </span>
                <span className="max-w-[220px] truncate text-neutral-200">
                  {pinned.text || pinned.selector}
                </span>
                <button
                  type="button"
                  className="text-neutral-400 underline-offset-2 hover:text-foreground hover:underline"
                  onClick={onClearPin}
                >
                  Clear
                </button>
              </div>
            ) : (
              <span className="text-xs text-neutral-500">
                Optional — pin a UI element to attach selector + text.
              </span>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Details
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={5000}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-neutral-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="What happened? What did you expect?"
            />
            <p className="mt-1 text-right text-[11px] text-neutral-600">
              {content.length}/5000
            </p>
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-2xl"
            onClick={() => void handleSubmit()}
            disabled={busy}
          >
            {busy ? "Sending…" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
