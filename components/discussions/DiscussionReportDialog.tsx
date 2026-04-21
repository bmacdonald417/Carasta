"use client";

import type { DiscussionReportReason } from "@prisma/client";
import { Flag } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const REASONS: Array<{ value: DiscussionReportReason; label: string }> = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "hate", label: "Hate" },
  { value: "illegal", label: "Illegal content" },
  { value: "self_harm", label: "Self-harm" },
  { value: "explicit", label: "Explicit content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "off_topic", label: "Off topic" },
  { value: "other", label: "Other" },
];

export function DiscussionReportDialog({
  target,
  threadId,
  replyId,
  contentLabel,
  className,
  variant = "outline",
}: {
  target: "thread" | "reply";
  threadId: string;
  replyId?: string;
  contentLabel: string;
  className?: string;
  variant?: "ghost" | "outline";
}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DiscussionReportReason>("other");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (status === "loading" || !session?.user) {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    try {
      const body =
        target === "thread"
          ? { target: "thread" as const, threadId, reason, details: details.trim() || null }
          : {
              target: "reply" as const,
              threadId,
              replyId: replyId!,
              reason,
              details: details.trim() || null,
            };
      const res = await fetch("/api/discussions/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.message === "string" ? data.message : "Could not submit report.");
        return;
      }
      if (data.deduped) {
        setMessage("We already have your open report for this reason.");
        return;
      }
      setOpen(false);
      setDetails("");
      setReason("other");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setMessage(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="sm"
          className={cn(
            "h-7 gap-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary",
            className
          )}
        >
          <Flag className="h-3.5 w-3.5" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-popover shadow-e2 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Report {target === "thread" ? "thread" : "reply"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {contentLabel}. Reports are reviewed by moderators. Misuse may affect your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as DiscussionReportReason)}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Details (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              maxLength={4000}
              className="resize-y border-border bg-background"
              placeholder="Add context that helps moderators understand the issue."
            />
          </div>
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={sending}>
              {sending ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
