import { cn } from "@/lib/utils";

export function LegalDraftBanner({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-neutral-200",
        className
      )}
    >
      <span className="font-semibold text-primary">Draft — pending legal review.</span>{" "}
      This page is not a final legal document.
    </p>
  );
}
