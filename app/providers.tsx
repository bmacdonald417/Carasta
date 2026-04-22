"use client";

import { SessionProvider } from "next-auth/react";
import { GuestGateProvider } from "@/components/guest-gate/GuestGateProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuestGateProvider>{children}</GuestGateProvider>
    </SessionProvider>
  );
}
