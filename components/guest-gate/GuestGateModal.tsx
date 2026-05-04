"use client";

import Link from "next/link";

import type { GuestGateIntent } from "@/components/guest-gate/GuestGateProvider";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function intentLine(intent: GuestGateIntent): string {
  switch (intent) {
    case "react":
      return "Reacting is unlocked for members.";
    case "comment":
      return "Commenting is unlocked for members.";
    case "reply":
      return "Replying is unlocked for members.";
    case "post":
      return "Posting is unlocked for members.";
    case "follow":
      return "Following is unlocked for members.";
    case "save":
    case "watchlist":
      return "Saving and watchlists are unlocked for members.";
    case "bid":
      return "Bidding is unlocked for members.";
    case "sell":
      return "Selling tools are unlocked for members.";
    case "message":
      return "Messaging is unlocked for members.";
    default:
      return "The full Carasta experience is for members.";
  }
}

export function GuestGateModal({
  open,
  onOpenChange,
  intent,
  nextUrl,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: GuestGateIntent;
  nextUrl: string;
  className?: string;
}) {
  const safeNext = nextUrl?.startsWith("/") ? nextUrl : "/explore";
  const activationCallback = `/welcome?next=${encodeURIComponent(safeNext)}`;
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(activationCallback)}`;
  const signUpHref = `/auth/sign-up?callbackUrl=${encodeURIComponent(activationCallback)}`;

  const steps = [
    "Create your account",
    "Set up your Carmunity identity",
    "Start exploring, posting, and engaging",
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-lg border-border bg-popover text-popover-foreground shadow-e3",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">Join Carmunity</DialogTitle>
          <DialogDescription>
            {intentLine(intent)} Joining is free — and it opens the full Carmunity + Market experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm font-semibold leading-snug text-foreground">
            Get in the car and drive with Carasta.
          </p>
          <ol className="space-y-2">
            {steps.map((label, index) => (
              <li
                key={label}
                className="flex gap-3 rounded-xl border border-border bg-secondary/50 px-3 py-2.5 shadow-e1"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-xs font-semibold text-primary"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 self-center text-sm text-foreground">{label}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs leading-relaxed text-muted-foreground">
            You can still browse public previews, but reactions, comments, saves, bids, and seller tools require an account.
          </p>
          <ContextualHelpCard context="guest.gate" className="justify-start" />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            asChild
            className="sm:mr-auto text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Link href={signInHref}>Sign in</Link>
          </Button>
          <Button variant="default" asChild className="rounded-full px-5">
            <Link href={signUpHref}>Join free</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

