"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type {
  CarmunityInterestPrefs,
  OnboardingSpaceOption,
} from "@/lib/carmunity/onboarding-service";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export function CarmunitySettingsSection({
  spaces,
  initialPrefs,
  onboardingCompleted,
}: {
  spaces: OnboardingSpaceOption[];
  initialPrefs: CarmunityInterestPrefs;
  onboardingCompleted: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [gearSlugs, setGearSlugs] = useState<Set<string>>(
    () => new Set(initialPrefs.gearSlugs ?? [])
  );
  const [lowerCats, setLowerCats] = useState<Array<{ spaceSlug: string; slug: string }>>(
    () => initialPrefs.lowerCategories ?? []
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setGearSlugs(new Set(initialPrefs.gearSlugs ?? []));
    setLowerCats(initialPrefs.lowerCategories ?? []);
  }, [initialPrefs]);

  const selectedSpaces = useMemo(() => {
    return spaces.filter((s) => gearSlugs.has(s.slug));
  }, [spaces, gearSlugs]);

  function toggleGear(slug: string) {
    setGearSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
        setLowerCats((lc) => lc.filter((c) => c.spaceSlug !== slug));
      } else {
        if (next.size >= 8) return prev;
        next.add(slug);
      }
      return next;
    });
  }

  function toggleLower(spaceSlug: string, slug: string) {
    setLowerCats((prev) => {
      const exists = prev.some((c) => c.spaceSlug === spaceSlug && c.slug === slug);
      if (exists) return prev.filter((c) => !(c.spaceSlug === spaceSlug && c.slug === slug));
      if (prev.length >= 16) return prev;
      return [...prev, { spaceSlug, slug }];
    });
  }

  async function savePrefs() {
    setBusy(true);
    try {
      const res = await fetch("/api/user/carmunity-onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gearSlugs: Array.from(gearSlugs),
          lowerCategories: lowerCats,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        toast({ title: j.message ?? "Could not save interests", variant: "destructive" });
        return;
      }
      toast({ title: "Carmunity interests updated" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function revisitOnboarding() {
    if (
      !confirm(
        "Re-open Carmunity onboarding? You’ll continue on Explore — your saved interests stay unless you change them there."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/user/carmunity-onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetOnboarding: true }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        toast({ title: j.message ?? "Could not reset onboarding", variant: "destructive" });
        return;
      }
      toast({ title: "Opening Explore…" });
      router.push("/explore");
    } finally {
      setBusy(false);
    }
  }

  const chipBase =
    "rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none";

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Carmunity
            </p>
            <CardTitle className="text-lg">{"Interests & discovery"}</CardTitle>
            <CardDescription className="max-w-prose text-pretty">
              Gears and Lower Gears power discovery and recommendations. Updates apply on your
              next navigation — Discussions and Explore pick them up automatically.
            </CardDescription>
            {!onboardingCompleted ? (
              <p
                className={cn(
                  "rounded-lg border border-caution/30 bg-caution-soft/25 px-3 py-2 text-sm",
                  "text-caution-foreground"
                )}
              >
                Finish onboarding on{" "}
                <span className="font-medium text-foreground">Explore</span> to unlock the full
                feed experience.
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={revisitOnboarding}
            className="shrink-0 text-xs font-medium"
          >
            Revisit onboarding
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Gears
          </p>
          <div className="flex flex-wrap gap-2">
            {spaces.map((s) => {
              const on = gearSlugs.has(s.slug);
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggleGear(s.slug)}
                  className={cn(
                    chipBase,
                    shellFocusRing,
                    on
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        {selectedSpaces.length > 0 ? (
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lower gears (optional)
            </p>
            {selectedSpaces.map((s) => (
              <div key={s.slug} className="space-y-2">
                <p className="text-xs font-semibold text-foreground">{s.title}</p>
                <div className="flex flex-wrap gap-2">
                  {s.categories.map((c) => {
                    const on = lowerCats.some((x) => x.spaceSlug === s.slug && x.slug === c.slug);
                    return (
                      <button
                        key={`${s.slug}:${c.slug}`}
                        type="button"
                        onClick={() => toggleLower(s.slug, c.slug)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition",
                          "focus-visible:outline-none",
                          shellFocusRing,
                          on
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:text-foreground"
                        )}
                      >
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="button" disabled={busy} onClick={savePrefs} variant="default">
          {busy ? "Saving…" : "Save Carmunity interests"}
        </Button>
      </CardFooter>
    </Card>
  );
}
