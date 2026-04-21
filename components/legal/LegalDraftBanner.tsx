import { cn } from "@/lib/utils";

export function LegalDraftBanner({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950",
        className
      )}
    >
      <span className="font-semibold text-amber-800">
        Draft structure pending legal review.
      </span>{" "}
      This page is written to clarify the current platform model and support
      paths, but it is not yet a final legal document.
    </p>
  );
}
