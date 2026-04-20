import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function createListingAiRun(params: {
  createdById: string;
  auctionId: string | null;
  intake: unknown;
  output: unknown;
  model: string;
}) {
  return prisma.listingAiRun.create({
    data: {
      createdById: params.createdById,
      auctionId: params.auctionId,
      intakeJson: params.intake as Prisma.InputJsonValue,
      outputJson: params.output as Prisma.InputJsonValue,
      model: params.model,
    },
    select: { id: true, createdAt: true },
  });
}
