import Link from "next/link";
import Image from "next/image";

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
}: {
  handle: string;
  cars: GaragePreviewCar[];
}) {
  const href = `/u/${handle}/garage`;

  if (cars.length === 0) {
    return (
      <Link
        href={href}
        className="group flex aspect-[21/9] max-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/15 px-6 text-center transition hover:border-primary/30 hover:bg-muted/25"
      >
        <p className="text-sm font-medium text-foreground">Garage</p>
        <p className="mt-1 text-xs text-muted-foreground">No cars yet — open to add from the web</p>
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cars.map((car) => (
        <Link
          key={car.id}
          href={href}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-muted/30 transition hover:border-primary/30 hover:shadow-md"
        >
          {car.imageUrl ? (
            <Image
              src={car.imageUrl}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
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
