import { Card } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="carasta-container max-w-3xl space-y-8 py-10 pb-16">
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/70 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="carmunity-skeleton-pulse mx-auto h-32 w-32 shrink-0 rounded-full bg-muted sm:mx-0" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="carmunity-skeleton-pulse mx-auto h-3 w-24 rounded bg-muted sm:mx-0" />
            <div className="carmunity-skeleton-pulse mx-auto h-8 w-full max-w-xs rounded bg-muted sm:mx-0" />
            <div className="carmunity-skeleton-pulse mx-auto h-3 w-40 rounded bg-muted sm:mx-0" />
            <div className="carmunity-skeleton-pulse mx-auto mt-4 h-16 w-full max-w-md rounded bg-muted sm:mx-0" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2 border-t border-border/40 pt-6 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`stat-skel-${i}`} className="carmunity-skeleton-pulse h-14 rounded-lg bg-muted/80" />
          ))}
        </div>
      </section>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`btn-skel-${i}`} className="carmunity-skeleton-pulse h-9 w-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="carmunity-skeleton-pulse h-6 w-32 rounded bg-muted" />
        <div className="carmunity-skeleton-pulse h-40 w-full rounded-2xl bg-muted/80" />
      </div>
      <div className="space-y-3">
        <div className="carmunity-skeleton-pulse h-6 w-24 rounded bg-muted" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={`post-skel-${i}`}
            className="carmunity-skeleton-pulse overflow-hidden border-border/50 bg-card/50 p-0"
          >
            <div className="h-4 w-1/3 p-4">
              <div className="h-3 w-full rounded bg-muted" />
            </div>
            <div className="aspect-[4/3] w-full bg-muted/70 sm:aspect-video" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
