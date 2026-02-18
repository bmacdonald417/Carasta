"use client";

import { motion } from "framer-motion";

type ReserveMeterProps = {
  currentCents: number;
  reserveCents: number | null;
  showLabel?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

export function ReserveMeter({
  currentCents,
  reserveCents,
  showLabel = true,
  variant = "light",
  className = "",
}: ReserveMeterProps) {
  if (reserveCents == null || reserveCents <= 0) return null;

  const percent = Math.min(
    100,
    Math.round((currentCents / reserveCents) * 100)
  );

  const isDark = variant === "dark";

  return (
    <div className={className}>
      {showLabel && (
        <div
          className={`mb-1.5 flex justify-between text-xs ${
            isDark ? "text-white/80" : "text-muted-foreground"
          }`}
        >
          <span>Reserve</span>
          <span>{percent}% met</span>
        </div>
      )}
      <div
        className={`h-1.5 overflow-hidden rounded-full ${
          isDark ? "bg-white/20" : "bg-muted"
        }`}
      >
        <motion.div
          className="h-full rounded-full reserve-meter"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
