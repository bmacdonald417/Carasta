import { cn } from "@/lib/utils";

export function DemoProfileBanner({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100",
        className
      )}
    >
      <span className="font-semibold text-amber-200">Demo profile.</span> This
      account is seeded for Carmunity preview. See{" "}
      <span className="font-mono text-xs text-amber-100/90">
        CARMUNITY_DISCUSSIONS_DEMO_CONTENT.md
      </span>
      .
    </p>
  );
}
