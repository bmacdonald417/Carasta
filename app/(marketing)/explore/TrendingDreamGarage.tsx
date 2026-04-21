"use client";

import { useEffect, useState } from "react";
import { Car } from "lucide-react";

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
    <section className="mb-8 mt-8 rounded-2xl border border-border bg-card p-5 shadow-e1 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Car className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        Trending Dream Garage
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Dream cars from Carmunity</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, i) => (
          <GarageCard3D key={car.id} car={car} ownerHandle={car.owner.handle} index={i} />
        ))}
      </div>
    </section>
  );
}
