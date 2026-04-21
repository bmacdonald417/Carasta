import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export default async function DreamGaragePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  const isOwn = (session?.user as any)?.id === user.id;

  const cars = await prisma.garageCar.findMany({
    where: { ownerId: user.id, type: "DREAM" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="carasta-container max-w-5xl space-y-8 py-10 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Wishlist
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dream garage</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Cars @{user.handle} is chasing — same layout language as the owned garage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOwn ? (
            <Button size="sm" variant="default" asChild className={cn(shellFocusRing)}>
              <Link href="/dream/add">Add car</Link>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
            <Link href={`/u/${user.handle}`}>Profile</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {cars.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center shadow-e1 sm:px-10">
            <p className="text-sm font-semibold text-foreground">Dream sheet is blank</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
              {isOwn
                ? "Pin the cars you’re chasing — it’s a public moodboard that pairs with your owned garage."
                : "They haven’t shared dream picks yet. Explore Carmunity or peek at their owned garage."}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              {isOwn ? (
                <Button size="sm" asChild className={cn(shellFocusRing)}>
                  <Link href="/dream/add">Add a dream car</Link>
                </Button>
              ) : null}
              <Button size="sm" variant="outline" asChild className={cn("border-border", shellFocusRing)}>
                <Link href={`/u/${user.handle}`}>Profile</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className={cn("border-border", shellFocusRing)}>
                <Link href="/explore">Explore Carmunity</Link>
              </Button>
            </div>
          </div>
        ) : (
          cars.map((car) => (
            <Card key={car.id} className="overflow-hidden transition-colors hover:border-primary/30">
              <div className="relative aspect-[4/3] w-full bg-muted sm:aspect-video">
                {car.images[0]?.url ? (
                  <Image
                    src={car.images[0].url}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No photo
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="text-base font-semibold text-foreground">
                  {car.year} {car.make} {car.model}
                </p>
                {car.trim && (
                  <p className="text-sm text-muted-foreground">{car.trim}</p>
                )}
                {car.notes && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {car.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
