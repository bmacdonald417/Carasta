import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export type GaragePreviewCar = {
  id: string;
  year: number;
  make: string;
  model: string;
  imageUrl: string | null;
};

/**
 * Image-first garage strip for profile — links through to full garage.
 */
export function ProfileGaragePreviewGrid({
  handle,
  cars,
  isOwnProfile = false,
}: {
  handle: string;
  cars: GaragePreviewCar[];
  /** When true, show “Add a car” for the signed-in owner viewing their profile. */
  isOwnProfile?: boolean;
}) {
  const href = `/u/${handle}/garage`;

  if (cars.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 bg-gradient-to-b from-muted/25 to-muted/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Garage portfolio</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            {isOwnProfile
              ? "Your collection is empty — add a car on the web to make this grid shine."
              : "No public garage cars yet — when they add rides, thumbnails appear here."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {isOwnProfile ? (
            <Button size="sm" asChild>
              <Link href="/garage/add">Add a car</Link>
            </Button>
          ) : null}
          <Button size="sm" variant="outline" asChild>
            <Link href={href}>Open garage</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cars.map((car) => (
        <Link
          key={car.id}
          href={href}
          className="carmunity-feed-card group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-muted/30 hover:border-primary/30"
        >
          {car.imageUrl ? (
            <Image
              src={car.imageUrl}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover transition duration-200 ease-out motion-safe:group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 200px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/50">
              <span className="px-2 text-center text-[11px] font-medium text-muted-foreground">
                {car.year} {car.make}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="truncate text-xs font-semibold tracking-tight text-white drop-shadow-sm">
              {car.year} {car.make} {car.model}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
