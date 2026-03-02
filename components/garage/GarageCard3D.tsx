"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type GarageCar = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  notes: string | null;
  type: string;
  images: { url: string }[];
};

export function GarageCard3D({
  car,
  ownerHandle,
  index = 0,
}: {
  car: GarageCar;
  ownerHandle: string;
  index?: number;
}) {
  const img = car.images[0]?.url ?? "https://placehold.co/600x400/1a1a1a/666?text=No+image";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Link href={`/u/${ownerHandle}/garage`}>
        <Card className="overflow-hidden border-white/10 bg-white/5 transition-all duration-300 hover:border-[#00E5FF]/30 hover:shadow-lg hover:shadow-[#00E5FF]/5">
          <div
            className="relative aspect-video w-full overflow-hidden bg-neutral-900"
            style={{
              transform: "perspective(800px) rotateX(2deg)",
              transformOrigin: "center bottom",
            }}
          >
            <Image
              src={img}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="font-display text-sm font-semibold text-white drop-shadow-lg">
                {car.year} {car.make} {car.model}
              </p>
              <p className="text-xs text-white/80">@{ownerHandle}</p>
            </div>
          </div>
          <CardContent className="border-t border-white/5 p-4">
            <p className="font-display font-semibold text-neutral-100">
              {car.year} {car.make} {car.model}
            </p>
            {car.trim && (
              <p className="text-sm text-neutral-400">{car.trim}</p>
            )}
            {car.notes && (
              <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                {car.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
