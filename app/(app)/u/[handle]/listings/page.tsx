import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { ListingsFilters } from "./listings-filters";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { isListingAiEnabled } from "@/lib/listing-ai/listing-ai-feature-flag";
import { ListingsAiRefineDialog } from "@/components/sell/listings-ai-refine-dialog";

const PAGE_SIZE = 20;
const STATUSES = ["LIVE", "DRAFT", "SOLD", "ENDED"] as const;

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { handle } = await params;
  const sp = await searchParams;
  const statusFilter =
    typeof sp.status === "string" && STATUSES.includes(sp.status as any)
      ? (sp.status as (typeof STATUSES)[number])
      : undefined;
  const cursor = typeof sp.cursor === "string" ? sp.cursor : undefined;

  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  const isOwn = (session?.user as { id?: string } | undefined)?.id === user.id;

  if (!isOwn) notFound();

  const where: { sellerId: string; status?: string } = { sellerId: user.id };
  if (statusFilter) where.status = statusFilter;

  const auctions = await prisma.auction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      _count: { select: { bids: true } },
    },
  });

  const hasMore = auctions.length > PAGE_SIZE;
  const items = hasMore ? auctions.slice(0, PAGE_SIZE) : auctions;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  const listingAiEnabled = isListingAiEnabled();

  return (
    <div className="carasta-container max-w-6xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">My listings</h1>
        <div className="flex items-center gap-4">
          {isMarketingEnabled() ? (
            <Link
              href={`/u/${user.handle}/marketing`}
              className={cn(
                "text-sm text-muted-foreground transition-colors hover:text-foreground",
                shellFocusRing,
                "rounded-md"
              )}
            >
              Marketing
            </Link>
          ) : null}
          <Link
            href={`/u/${user.handle}`}
            className={cn(
              "text-sm text-muted-foreground transition-colors hover:text-foreground",
              shellFocusRing,
              "rounded-md"
            )}
          >
            ← @{user.handle}
          </Link>
        </div>
      </div>
      <p className="text-muted-foreground">
        Auctions you&apos;ve created. Filter by status.
      </p>

      <ListingsFilters currentStatus={statusFilter} handle={user.handle} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground shadow-e1">
            No listings yet.
          </p>
        ) : (
          items.map((a) => {
            const highBidCents = computeCurrentBidCents(a.bids);
            const statusBadgeClass =
              a.status === "LIVE"
                ? "border-signal/40 bg-signal/10 text-signal"
                : a.status === "SOLD"
                  ? "border-success/40 bg-success-soft text-success-foreground"
                  : "border-border bg-muted text-muted-foreground";
            return (
            <Card key={a.id} className="overflow-hidden transition-colors hover:border-primary/35">
              <Link href={`/auctions/${a.id}`} className="relative block aspect-video w-full overflow-hidden bg-muted">
                <Image
                  src={
                    a.images[0]?.url ??
                    "https://placehold.co/600x400/1a1a1a/666?text=No+image"
                  }
                  alt={a.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute left-3 top-3">
                  <Badge
                    variant="outline"
                    className={cn("rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase", statusBadgeClass)}
                  >
                    {a.status}
                  </Badge>
                </div>
              </Link>
              <CardContent className="border-t border-border p-4">
                <p className="text-xs text-muted-foreground">
                  {a.year} {a.make} {a.model}
                </p>
                <Link href={`/auctions/${a.id}`} className={cn("block", shellFocusRing, "rounded-sm")}>
                  <h2 className="mt-1 line-clamp-1 text-base font-semibold text-foreground transition-colors hover:text-primary">
                    {a.title}
                  </h2>
                </Link>
                {a.status === "LIVE" && (
                  <p className="mt-2 text-sm font-medium text-signal">
                    {formatCurrency(highBidCents)} high bid
                    <span className="ml-1 font-normal text-muted-foreground">· {a._count.bids} bids</span>
                  </p>
                )}
                {a.status === "SOLD" && (
                  <p className="mt-2 text-sm font-medium text-success">
                    Sold
                    {a.buyerId
                      ? ` at ${formatCurrency(a.buyNowPriceCents ?? 0)}`
                      : highBidCents > 0
                        ? ` at ${formatCurrency(highBidCents)}`
                        : ""}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
                    <Link href={`/auctions/${a.id}`}>View listing</Link>
                  </Button>
                  <ListingsAiRefineDialog
                    listingAiEnabled={listingAiEnabled}
                    row={{
                      id: a.id,
                      status: a.status,
                      title: a.title,
                      year: a.year,
                      make: a.make,
                      model: a.model,
                      trim: a.trim,
                      mileage: a.mileage,
                      vin: a.vin,
                      description: a.description,
                      conditionSummary: a.conditionSummary,
                      conditionGrade: a.conditionGrade
                        ? String(a.conditionGrade)
                        : null,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
          })
        )}
      </div>

      {hasMore && nextCursor && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" asChild className={cn("border-border", shellFocusRing)}>
            <Link
              href={`/u/${user.handle}/listings?cursor=${nextCursor}${
                statusFilter ? `&status=${statusFilter}` : ""
              }`}
            >
              Load more
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
