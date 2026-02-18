"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  endAt: Date;
  className?: string;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ endAt, className = "" }: CountdownTimerProps) {
  const [now, setNow] = useState(() => new Date());
  const end = new Date(endAt);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = end.getTime() - now.getTime();
  const isEnded = diff <= 0;

  if (isEnded) {
    return (
      <span className={`font-medium text-muted-foreground ${className}`}>
        Ended
      </span>
    );
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((diff % (60 * 1000)) / 1000);

  if (days > 0) {
    return (
      <span className={`font-mono text-sm font-medium ${className}`}>
        {days}d {pad(hours)}h {pad(mins)}m left
      </span>
    );
  }

  return (
    <span className={`font-mono text-sm font-medium tabular-nums ${className}`}>
      {pad(hours)}:{pad(mins)}:{pad(secs)} left
    </span>
  );
}
