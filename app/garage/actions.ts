"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addGarageCar(input: {
  type: "GARAGE" | "DREAM";
  year: number;
  make: string;
  model: string;
  trim?: string;
  notes?: string;
  imageUrls: string[];
}) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const handle = (session.user as any).handle;
  if (!handle) return { ok: false, error: "No handle." };

  const car = await prisma.garageCar.create({
    data: {
      ownerId: (session.user as any).id,
      type: input.type,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim ?? null,
      notes: input.notes ?? null,
    },
  });

  if (input.imageUrls.length > 0) {
    await prisma.garageCarImage.createMany({
      data: input.imageUrls.map((url, i) => ({
        garageCarId: car.id,
        url,
        sortOrder: i,
      })),
    });
  }

  revalidatePath(`/u/${handle}`);
  revalidatePath(`/u/${handle}/garage`);
  revalidatePath(`/u/${handle}/dream`);
  return { ok: true, handle };
}
