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
      className="relative flex gap-4 scroll-mt-24 md:gap-6"
    >
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/35 bg-card text-primary shadow-e1 md:h-12 md:w-12">
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </div>

      <div className="group relative flex-1 rounded-2xl border border-border bg-card p-5 shadow-e1 transition-colors hover:border-primary/20 md:p-6">
        <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="text-lg font-semibold text-foreground md:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
