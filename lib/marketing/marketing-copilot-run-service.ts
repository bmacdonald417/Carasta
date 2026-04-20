import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { stableJsonHash } from "@/lib/marketing/marketing-copilot-hash";

export async function createMarketingCopilotRun(params: {
  auctionId: string;
  createdById: string;
  intake: unknown;
  output: unknown;
  model: string;
}) {
  const intakeJson = params.intake as Prisma.InputJsonValue;
  const outputJson = params.output as Prisma.InputJsonValue;
  return prisma.marketingCopilotRun.create({
    data: {
      auctionId: params.auctionId,
      createdById: params.createdById,
      intakeJson,
      outputJson,
      inputHash: stableJsonHash(params.intake),
      outputHash: stableJsonHash(params.output),
      model: params.model,
    },
  });
}

export async function markCopilotRunApplied(params: {
  runId: string;
  userId: string;
  auctionId: string;
}): Promise<boolean> {
  const res = await prisma.marketingCopilotRun.updateMany({
    where: {
      id: params.runId,
      createdById: params.userId,
      auctionId: params.auctionId,
      appliedAt: null,
    },
    data: { appliedAt: new Date() },
  });
  return res.count > 0;
}

export async function assertCopilotRunForApply(params: {
  runId: string;
  userId: string;
  auctionId: string;
}): Promise<boolean> {
  const row = await prisma.marketingCopilotRun.findFirst({
    where: {
      id: params.runId,
      createdById: params.userId,
      auctionId: params.auctionId,
    },
    select: { id: true },
  });
  return Boolean(row);
}
