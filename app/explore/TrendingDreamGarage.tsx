"use client";

import { useEffect, useState } from "react";
import { GarageCard3D } from "@/components/garage/GarageCard3D";
import { Car } from "lucide-react";

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
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wider text-[#00E5FF]">
        <Car className="h-5 w-5" />
        Trending Dream Garage
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Dream cars from the community
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, i) => (
          <GarageCard3D
            key={car.id}
            car={car}
            ownerHandle={car.owner.handle}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
