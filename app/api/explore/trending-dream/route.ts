import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dreamCars = await prisma.garageCar.findMany({
    where: { type: "DREAM" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      owner: { select: { handle: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  return NextResponse.json({ cars: dreamCars });
}
