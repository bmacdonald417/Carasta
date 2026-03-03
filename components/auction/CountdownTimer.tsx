"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  formatTimeLeft,
  getUrgencyLevel,
  type UrgencyLevel,
} from "@/lib/time";
import { useMounted } from "@/hooks";

type CountdownTimerProps = {
  endAt: Date | string;
  className?: string;
  /** Dark overlay variant (e.g. hero) */
  variant?: "default" | "dark";
};

const urgencyStyles: Record<
  UrgencyLevel,
  { default: string; dark: string; pulse?: boolean }
> = {
  normal: { default: "text-muted-foreground", dark: "text-white/80" },
  subtle: { default: "text-[#ff3b5c]/80", dark: "text-[#ff3b5c]/90" },
  elevated: {
    default: "text-[#ff3b5c] font-semibold",
    dark: "text-[#ff3b5c] font-semibold",
    pulse: true,
  },
  ended: { default: "text-muted-foreground", dark: "text-white/60" },
};

export function CountdownTimer({
  endAt,
  className = "",
  variant = "default",
}: CountdownTimerProps) {
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const end = typeof endAt === "string" ? new Date(endAt) : endAt;
  const diff = end.getTime() - now.getTime();
  const urgency = getUrgencyLevel(diff);
  const style = urgencyStyles[urgency];
  const urgencyClass = variant === "dark" ? style.dark : style.default;
  const pulse = style.pulse;

  const baseClass = "font-mono text-sm tabular-nums";
  const combinedClass = `${baseClass} ${urgencyClass} ${className}`.trim();

  if (!mounted) {
    return (
      <span className={`${baseClass} text-muted-foreground ${className}`.trim()} suppressHydrationWarning>
        —
      </span>
    );
  }

  if (urgency === "ended") {
    return (
      <span className={`font-medium ${urgencyClass} ${className}`.trim()}>
        Ended
      </span>
    );
  }

  const content = formatTimeLeft(diff);

  if (pulse) {
    return (
      <motion.span
        className={combinedClass}
        animate={{ opacity: [1, 0.85, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {content}
      </motion.span>
    );
  }

  return <span className={combinedClass}>{content}</span>;
}
