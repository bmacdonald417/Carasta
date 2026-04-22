"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { GuestGateModal } from "@/components/guest-gate/GuestGateModal";

export type GuestGateIntent =
  | "react"
  | "comment"
  | "reply"
  | "post"
  | "follow"
  | "save"
  | "watchlist"
  | "bid"
  | "sell"
  | "message"
  | "general";

type GateState = {
  open: boolean;
  intent: GuestGateIntent;
  nextUrl: string;
};

type GuestGateApi = {
  openGate: (args?: Partial<Pick<GateState, "intent" | "nextUrl">>) => void;
  closeGate: () => void;
};

const GuestGateContext = createContext<GuestGateApi | null>(null);

export function GuestGateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<GateState>(() => ({
    open: false,
    intent: "general",
    nextUrl: pathname || "/explore",
  }));

  const closeGate = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const openGate = useCallback(
    (args?: Partial<Pick<GateState, "intent" | "nextUrl">>) => {
      setState((prev) => ({
        open: true,
        intent: args?.intent ?? prev.intent ?? "general",
        nextUrl: args?.nextUrl ?? prev.nextUrl ?? pathname ?? "/explore",
      }));
    },
    [pathname]
  );

  const api = useMemo<GuestGateApi>(() => ({ openGate, closeGate }), [openGate, closeGate]);

  return (
    <GuestGateContext.Provider value={api}>
      {children}
      <GuestGateModal
        open={state.open}
        onOpenChange={(open) => (open ? api.openGate() : api.closeGate())}
        intent={state.intent}
        nextUrl={state.nextUrl}
      />
    </GuestGateContext.Provider>
  );
}

export function useGuestGate() {
  const ctx = useContext(GuestGateContext);
  if (!ctx) {
    throw new Error("useGuestGate must be used within GuestGateProvider");
  }
  return ctx;
}

