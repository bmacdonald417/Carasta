import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GarageCard3D } from "@/components/garage/GarageCard3D";

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
    <div className="carasta-container max-w-4xl py-8">
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
          <p className="col-span-full py-8 text-center text-neutral-500">
            No cars in garage yet.
          </p>
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
