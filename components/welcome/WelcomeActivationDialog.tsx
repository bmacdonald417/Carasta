"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { OnboardingPack } from "@/lib/carmunity/onboarding-service";
import { CarmunityOnboardingDialog } from "@/components/carmunity/CarmunityOnboardingDialog";

export function WelcomeActivationDialog({
  pack,
  nextUrl,
}: {
  pack: OnboardingPack | null;
  nextUrl: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(pack));

  useEffect(() => {
    setOpen(Boolean(pack));
  }, [pack]);

  return (
    <CarmunityOnboardingDialog
      pack={pack}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          const next = nextUrl?.startsWith("/") ? nextUrl : "/explore";
          // Keep the welcome surface brief: once onboarding closes, move the user into the app.
          router.replace(next);
          router.refresh();
        }
      }}
    />
  );
}

