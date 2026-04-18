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
  const img = car.images[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Link href={`/u/${ownerHandle}/garage`}>
        <Card className="overflow-hidden border border-border/50 bg-card/60 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          <div
            className="relative aspect-[4/3] w-full overflow-hidden bg-muted sm:aspect-video"
            style={{
              transform: "perspective(800px) rotateX(2deg)",
              transformOrigin: "center bottom",
            }}
          >
            {img ? (
              <Image
                src={img}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-1 bg-muted px-4 text-center">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  No photo
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {car.year} {car.make} {car.model}
                </span>
              </div>
            )}
            {img ? (
              <>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-display text-sm font-semibold text-white drop-shadow-lg">
                    {car.year} {car.make} {car.model}
                  </p>
                  <p className="text-xs text-white/80">@{ownerHandle}</p>
                </div>
              </>
            ) : null}
          </div>
          <CardContent className="border-t border-border/40 p-4">
            <p className="font-display font-semibold text-foreground">
              {car.year} {car.make} {car.model}
            </p>
            {car.trim && (
              <p className="text-sm text-muted-foreground">{car.trim}</p>
            )}
            {car.notes && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {car.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
