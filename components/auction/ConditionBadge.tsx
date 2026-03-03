"use client";

import { motion } from "framer-motion";

type ConditionGrade =
  | "CONCOURS"
  | "EXCELLENT"
  | "VERY_GOOD"
  | "GOOD"
  | "FAIR";

const GRADE_STYLES: Record<
  ConditionGrade,
  { glow: string; border: string; text: string }
> = {
  CONCOURS: {
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    border: "border-emerald-500/60",
    text: "text-emerald-400",
  },
  EXCELLENT: {
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    border: "border-blue-500/60",
    text: "text-blue-400",
  },
  VERY_GOOD: {
    glow: "shadow-[0_0_20px_rgba(255,255,255,0.25)]",
    border: "border-white/40",
    text: "text-neutral-200",
  },
  GOOD: {
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    border: "border-amber-500/60",
    text: "text-amber-400",
  },
  FAIR: {
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    border: "border-red-500/60",
    text: "text-red-400",
  },
};

export function ConditionBadge({ grade }: { grade: ConditionGrade }) {
  const style = GRADE_STYLES[grade];
  const label = grade.replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`inline-flex items-center justify-center rounded-xl border-2 px-6 py-3 font-display text-lg font-semibold uppercase tracking-wider ${style.border} ${style.glow} ${style.text} bg-black/30 backdrop-blur-sm`}
    >
      {label}
    </motion.div>
  );
}
