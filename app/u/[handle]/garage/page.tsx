import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Garage</h1>
        <div className="flex items-center gap-2">
          {isOwn && (
            <Button size="sm" variant="performance" asChild>
              <Link href="/garage/add">Add car</Link>
            </Button>
          )}
          <Link
            href={`/u/${user.handle}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← @{user.handle}
          </Link>
        </div>
      </div>
      <p className="text-muted-foreground">
        Cars {user.handle} owns.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cars.length === 0 ? (
          <p className="col-span-full py-8 text-center text-muted-foreground">
            No cars in garage yet.
          </p>
        ) : (
          cars.map((car) => (
            <Card key={car.id} className="overflow-hidden">
              <div className="relative aspect-video w-full bg-muted">
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
                <p className="font-display font-semibold">
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
