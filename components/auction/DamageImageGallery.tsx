"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DamageImage = { id: string; label: string; imageUrl: string };

export function DamageImageGallery({ images }: { images: DamageImage[] }) {
  const [selected, setSelected] = useState<DamageImage | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">
          Damage images
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((d) => (
            <motion.button
              key={d.id}
              type="button"
              onClick={() => setSelected(d)}
              className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 transition-all hover:border-[#ff3b5c]/40 hover:shadow-[0_0_12px_rgba(255,59,92,0.2)] focus:outline-none focus:ring-2 focus:ring-[#ff3b5c]/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src={d.imageUrl}
                alt={d.label}
                fill
                unoptimized
                className="object-cover"
                sizes="128px"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-xs text-white">
                {d.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent
            className="max-w-4xl border-white/10 bg-black/95 backdrop-blur-xl"
            showClose={true}
          >
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {selected.label}
                  </DialogTitle>
                </DialogHeader>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="relative aspect-video w-full overflow-hidden rounded-xl"
                >
                  <Image
                    src={selected.imageUrl}
                    alt={selected.label}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width: 896px) 100vw, 800px"
                  />
                </motion.div>
              </>
            )}
          </DialogContent>
        </Dialog>
    </>
  );
}
