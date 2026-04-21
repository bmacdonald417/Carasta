"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { CarmunityInterestPrefs, OnboardingSpaceOption } from "@/lib/carmunity/onboarding-service";

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-[1px]">
        <div className="rounded-2xl border border-white/5 bg-[#0c0c10]/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                Carmunity
              </p>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                Interests & discovery
              </h2>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                Gears and Lower Gears power discovery and recommendations. Updates apply on your next
                navigation — Discussions and Explore pick them up automatically.
              </p>
              {!onboardingCompleted ? (
                <p className="mt-2 text-xs text-amber-200/90">
                  Finish onboarding on{" "}
                  <span className="font-medium text-foreground">Explore</span> to unlock the full feed
                  experience.
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={revisitOnboarding}
              className="shrink-0 border-primary/35 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
            >
              Revisit onboarding
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Gears</p>
            <div className="flex flex-wrap gap-2">
              {spaces.map((s) => {
                const on = gearSlugs.has(s.slug);
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => toggleGear(s.slug)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      on
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border/60 bg-muted/10 text-muted-foreground hover:border-primary/35 hover:text-neutral-200"
                    }`}
                  >
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSpaces.length > 0 ? (
            <div className="mt-6 space-y-4 rounded-xl border border-border/40 bg-muted/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Lower Gears (optional)
              </p>
              {selectedSpaces.map((s) => (
                <div key={s.slug} className="space-y-2">
                  <p className="text-xs font-medium text-neutral-200">{s.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.categories.map((c) => {
                      const on = lowerCats.some((x) => x.spaceSlug === s.slug && x.slug === c.slug);
                      return (
                        <button
                          key={`${s.slug}:${c.slug}`}
                          type="button"
                          onClick={() => toggleLower(s.slug, c.slug)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                            on
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
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

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={busy}
              onClick={savePrefs}
              className="bg-primary/90 text-[#0a0a0f] hover:bg-primary"
            >
              {busy ? "Saving…" : "Save Carmunity interests"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
