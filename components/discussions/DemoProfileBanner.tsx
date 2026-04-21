import { cn } from "@/lib/utils";

export function DemoProfileBanner({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-xl border border-caution/25 bg-caution-soft/50 px-4 py-3 text-sm text-caution-foreground shadow-e1",
        className
      )}
    >
      <span className="font-semibold text-foreground">Demo profile.</span> This account is seeded
      for Carmunity preview. See{" "}
      <span className="font-mono text-xs text-muted-foreground">CARMUNITY_DISCUSSIONS_DEMO_CONTENT.md</span>
      .
    </p>
  );
}
