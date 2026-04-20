"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { OnboardingPack } from "@/lib/carmunity/onboarding-service";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CarmunityOnboardingDialog({
  pack,
  open,
  onOpenChange,
}: {
  pack: OnboardingPack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [gearSlugs, setGearSlugs] = useState<Set<string>>(() => new Set());
  const [lowerCats, setLowerCats] = useState<Array<{ spaceSlug: string; slug: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSpaces = useMemo(() => {
    if (!pack) return [];
    return pack.spaces.filter((s) => gearSlugs.has(s.slug));
  }, [pack, gearSlugs]);

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

  async function followUser(userId: string) {
    setError(null);
    const res = await fetch("/api/user/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setError(j.message ?? "Could not follow.");
    }
    router.refresh();
  }

  async function finish(savePrefs: boolean) {
    if (!pack) return;
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { complete: true };
      if (savePrefs) {
        body.gearSlugs = Array.from(gearSlugs);
        body.lowerCategories = lowerCats;
      }
      const res = await fetch("/api/user/carmunity-onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        setError(j.message ?? "Could not save.");
        return;
      }
      onOpenChange(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!pack) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-primary/20 bg-[#0c0c10]/95 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Welcome to Carmunity</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Pick a few Gears you care about, optionally tune Lower Gears, follow a voice or two, then
            dive into threads — one identity at{" "}
            <span className="text-neutral-200">/u/your-handle</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Interests</p>
            <p className="text-xs text-muted-foreground">
              Tap Gears to personalize discovery (you can change this later from Discussions).
            </p>
            <div className="flex flex-wrap gap-2">
              {pack.spaces.map((s) => {
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
          </section>

          {selectedSpaces.length > 0 ? (
            <section className="space-y-3 rounded-xl border border-border/40 bg-muted/5 p-3">
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
            </section>
          ) : null}

          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              People to follow
            </p>
            <ul className="divide-y divide-white/5 rounded-xl border border-border/40">
              {pack.suggestedUsers.slice(0, 6).map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-neutral-200"
                >
                  <Link href={`/u/${encodeURIComponent(u.handle)}`} className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={u.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback className="text-[10px]">
                        {(u.name ?? u.handle).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 truncate font-medium text-neutral-100">
                      {u.name?.trim() || `@${u.handle}`}
                    </span>
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-primary/35 bg-primary/5 text-[10px] font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
                    onClick={() => void followUser(u.id)}
                  >
                    Follow
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Starter threads</p>
            <ul className="space-y-1.5 text-sm">
              {pack.starterThreads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                    className="line-clamp-2 text-neutral-200 hover:text-primary"
                  >
                    {t.title}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    {t.gearSlug} / {t.lowerGearSlug}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={busy}
            onClick={() => void finish(true)}
          >
            Save interests & enter Carmunity
          </Button>
          <Button type="button" variant="ghost" className="w-full text-muted-foreground" disabled={busy} onClick={() => void finish(false)}>
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
