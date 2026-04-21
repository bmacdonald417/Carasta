"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";

type ReviewSurfaceCardProps = {
  title: string;
  route: string;
  purpose: string;
  seeded: string;
  focus: string[];
  mode: "interactive" | "read_only" | "mixed";
  bestStartingPoint?: boolean;
  caveat?: string;
};

function modeLabel(mode: ReviewSurfaceCardProps["mode"]) {
  if (mode === "interactive") return "Interactive";
  if (mode === "read_only") return "Read-only";
  return "Mixed";
}

export function ReviewSurfaceCard({
  title,
  route,
  purpose,
  seeded,
  focus,
  mode,
  bestStartingPoint = false,
  caveat,
}: ReviewSurfaceCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const absolute = `${window.location.origin}${route}`;
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-neutral-950">{title}</h3>
            {bestStartingPoint ? (
              <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Best starting point
              </span>
            ) : null}
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
              {modeLabel(mode)}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">{route}</p>
        </div>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-neutral-950">What this page should do</p>
          <p className="mt-1 leading-6 text-neutral-600">{purpose}</p>
        </div>
        <div>
          <p className="font-semibold text-neutral-950">Demo / seeded context</p>
          <p className="mt-1 leading-6 text-neutral-600">{seeded}</p>
        </div>
        <div>
          <p className="font-semibold text-neutral-950">What to pay attention to</p>
          <ul className="mt-2 space-y-1.5 text-neutral-600">
            {focus.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        {caveat ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="font-semibold">Review caveat</p>
            <p className="mt-1 leading-6">{caveat}</p>
          </div>
        ) : null}
        <div>
          <Link
            href={route}
            className="inline-flex rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Open surface
          </Link>
        </div>
      </div>
    </div>
  );
}
