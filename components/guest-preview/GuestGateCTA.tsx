"use client";

import { Button } from "@/components/ui/button";
import { useGuestGate, type GuestGateIntent } from "@/components/guest-gate/GuestGateProvider";
import { cn } from "@/lib/utils";

export function GuestGateCTA({
  intent,
  nextUrl,
  children,
  className,
}: {
  intent: GuestGateIntent;
  nextUrl: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { openGate } = useGuestGate();
  return (
    <Button
      type="button"
      size="sm"
      className={cn("rounded-full", className)}
      onClick={() => openGate({ intent, nextUrl })}
    >
      {children}
    </Button>
  );
}

