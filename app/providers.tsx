"use client";

import { SessionProvider } from "next-auth/react";
import { GuestGateProvider } from "@/components/guest-gate/GuestGateProvider";
import { HelpPaletteProvider } from "@/components/help/HelpPaletteProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuestGateProvider>
        <HelpPaletteProvider>{children}</HelpPaletteProvider>
      </GuestGateProvider>
    </SessionProvider>
  );
}
