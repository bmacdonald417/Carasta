import { cn } from "@/lib/utils";

export function LegalDraftBanner({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-2xl border border-caution/35 bg-caution-soft px-4 py-3 text-sm text-caution-foreground",
        className
      )}
    >
      <span className="font-semibold text-caution-foreground">
        Draft structure pending legal review.
      </span>{" "}
      This page is written to clarify the current platform model and support
      paths, but it is not yet a final legal document.
    </p>
  );
}
