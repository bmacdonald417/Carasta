import type { CollectorTier } from "@prisma/client";

const TIER_STYLES: Record<
  CollectorTier,
  { label: string; className: string }
> = {
  NEW: { label: "New", className: "text-neutral-400" },
  VERIFIED: { label: "Verified", className: "text-blue-400" },
  ELITE: {
    label: "Elite",
    className: "text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
  },
  APEX: {
    label: "Apex",
    className: "text-[#ff3b5c] shadow-[0_0_12px_rgba(255,59,92,0.4)]",
  },
};

export function ReputationBadge({
  tier,
  className,
}: {
  tier: CollectorTier;
  className?: string;
}) {
  const style = TIER_STYLES[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.className} ${className ?? ""}`}
      title={`Collector tier: ${style.label}`}
    >
      {style.label}
    </span>
  );
}
