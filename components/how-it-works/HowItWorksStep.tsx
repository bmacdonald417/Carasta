"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { staggerChild } from "@/lib/motion";

type HowItWorksStepProps = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  isInView: boolean;
};

export function HowItWorksStep({
  id,
  icon: Icon,
  title,
  description,
  index,
  isInView,
}: HowItWorksStepProps) {
  return (
    <motion.div
      id={id}
      variants={staggerChild(index, 0.06, 0.4)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative flex gap-4 md:gap-6 scroll-mt-24"
    >
      {/* Timeline dot with icon */}
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#ff3b5c]/50 bg-black/60 shadow-[0_0_12px_rgba(255,59,92,0.25)] md:h-12 md:w-12">
        <Icon className="h-4 w-4 text-[#ff3b5c] md:h-5 md:w-5" />
      </div>

      {/* Glass card */}
      <div className="group relative flex-1 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all hover:border-[#ff3b5c]/20 md:p-6">
        <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-transparent via-[#ff3b5c]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="font-display text-lg font-semibold text-foreground md:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400 md:text-base">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
