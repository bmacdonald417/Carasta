import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GarageCard3D } from "@/components/garage/GarageCard3D";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export default async function GaragePage({
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
    where: { ownerId: user.id, type: "GARAGE" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="carasta-container max-w-5xl space-y-8 py-10 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Collection
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Garage</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            @{user.handle}&apos;s owned rides — image-first portfolio. {cars.length} car
            {cars.length === 1 ? "" : "s"} on file.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOwn ? (
            <Button size="sm" variant="default" asChild className={cn(shellFocusRing)}>
              <Link href="/garage/add">Add car</Link>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
            <Link href={`/u/${user.handle}`}>Profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {cars.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center shadow-e1 sm:px-10">
            <p className="text-sm font-semibold text-foreground">Room in the garage</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
              {isOwn
                ? "Add your first car on the web — this grid becomes a rolling portfolio of what you actually own."
                : "They haven’t published rides yet. Peek at their profile or explore the feed while you wait."}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              {isOwn ? (
                <Button size="sm" asChild className={cn(shellFocusRing)}>
                  <Link href="/garage/add">Add a car</Link>
                </Button>
              ) : null}
              <Button size="sm" variant="outline" asChild className={cn("border-border", shellFocusRing)}>
                <Link href={`/u/${user.handle}`}>Back to profile</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className={cn("border-border", shellFocusRing)}>
                <Link href="/explore">Explore Carmunity</Link>
              </Button>
            </div>
          </div>
        ) : (
          cars.map((car, i) => (
            <GarageCard3D
              key={car.id}
              car={{ ...car, images: car.images }}
              ownerHandle={user.handle}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}
