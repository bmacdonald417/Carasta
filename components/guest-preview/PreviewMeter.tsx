"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { SignedOutPreviewNotice } from "@/components/guest-preview/SignedOutPreviewNotice";

type Surface = "post_detail" | "thread_detail" | "profile" | "other";

const STORAGE_KEY = "carasta_public_preview_v1";

function readCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function writeCounts(next: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy failures
  }
}

export function PreviewMeter({
  surface,
  threshold = 6,
}: {
  surface: Surface;
  /** After this many detail views, show a stronger join nudge (no hard block). */
  threshold?: number;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const [count, setCount] = useState<number>(0);

  const key = useMemo(() => `views:${surface}`, [surface]);

  useEffect(() => {
    if (signedIn) return;
    const cur = readCounts();
    const nextVal = (cur[key] ?? 0) + 1;
    const next = { ...cur, [key]: nextVal };
    writeCounts(next);
    setCount(nextVal);
  }, [key, signedIn]);

  if (signedIn) return null;
  if (count < threshold) return null;

  return (
    <SignedOutPreviewNotice
      title="Preview limit (light)"
      description="You’ve explored a lot in preview mode. Join free to react, reply, follow, save threads, and bid in Market."
      nextUrl={pathname || "/explore"}
      className="mt-4"
    />
  );
}

