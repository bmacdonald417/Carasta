"use client";

import { useEffect, useState } from "react";
import { Car, Sparkles } from "lucide-react";

import { GarageCard3D } from "@/components/garage/GarageCard3D";

type DreamCar = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  notes: string | null;
  type: string;
  owner: { handle: string };
  images: { url: string }[];
};

export function TrendingDreamGarage() {
  const [cars, setCars] = useState<DreamCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/explore/trending-dream")
      .then((r) => r.json())
      .then((d) => {
        setCars(d.cars ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || cars.length === 0) return null;

  return (
    <section
      id="trending-dream-garage"
      className="scroll-mt-24 rounded-2xl border border-border/80 bg-gradient-to-b from-primary/[0.04] to-card p-4 shadow-e2 ring-1 ring-primary/[0.08] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm">
              <Car className="h-4 w-4" aria-hidden />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
              Trending Dream Garage
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" aria-hidden />
              Hot
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Dream builds and wish-list cars the community is talking about right now.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, i) => (
          <GarageCard3D key={car.id} car={car} ownerHandle={car.owner.handle} index={i} />
        ))}
      </div>
    </section>
  );
}
