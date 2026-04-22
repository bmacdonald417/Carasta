"use client";

import { useEffect, useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
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
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!ack) return;
    const t = window.setTimeout(() => setAck(false), 650);
    return () => window.clearTimeout(t);
  }, [ack]);

  return (
    <LoadingButton
      type="button"
      size="sm"
      className={cn("rounded-full", className)}
      loading={ack}
      loadingLabel="Opening…"
      onClick={() => {
        setAck(true);
        openGate({ intent, nextUrl });
      }}
    >
      {children}
    </LoadingButton>
  );
}

