"use client";

import Link from "next/link";

import type { GuestGateIntent } from "@/components/guest-gate/GuestGateProvider";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg border-primary/15 bg-[#0c0c10]/95", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Join Carmunity</DialogTitle>
          <DialogDescription className="text-neutral-400">
            {intentLine(intent)} Joining is free — and it opens the full Carmunity + Market experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Get in the car and drive with Carasta.</span>
            </p>
            <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1.</span> Create your account
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> Set up your Carmunity identity
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span> Start exploring, posting, and engaging
              </li>
            </ol>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            You can still browse public previews, but reactions, comments, saves, bids, and seller tools require an account.
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" asChild className="sm:mr-auto">
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

