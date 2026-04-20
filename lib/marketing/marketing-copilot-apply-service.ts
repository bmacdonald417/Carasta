import {
  ListingMarketingArtifactType,
  ListingMarketingTaskStatus,
  ListingMarketingTaskType,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  MarketingCopilotPlanBlock,
  MarketingCopilotStructuredResult,
} from "@/lib/validations/marketing-copilot";

async function nextArtifactVersion(
  tx: Prisma.TransactionClient,
  planId: string,
  type: ListingMarketingArtifactType,
  channel: string
): Promise<number> {
  const agg = await tx.listingMarketingArtifact.aggregate({
    where: { planId, type, channel },
    _max: { version: true },
  });
  return (agg._max.version ?? 0) + 1;
}

/**
 * Merges copilot output into the single ListingMarketingPlan and appends tasks + artifacts.
 * Does not delete existing tasks or artifacts.
 */
export async function applyCopilotToWorkspace(params: {
  sellerId: string;
  auctionId: string;
  /** Persisted plan row fields only (summaryStrategy merged into positioning upstream). */
  planRow: Pick<
    MarketingCopilotPlanBlock,
    "objective" | "audience" | "positioning" | "channels"
  >;
  tasks: MarketingCopilotStructuredResult["tasks"];
  artifacts: MarketingCopilotStructuredResult["artifacts"];
}): Promise<{ planId: string }> {
  const { sellerId, auctionId, planRow, tasks, artifacts } = params;

  const auction = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: { id: true },
  });
  if (!auction) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const channelsJson = planRow.channels as unknown as Prisma.InputJsonValue;

  return prisma.$transaction(async (tx) => {
    let plan = await tx.listingMarketingPlan.findUnique({
      where: { auctionId },
    });

    if (!plan) {
      plan = await tx.listingMarketingPlan.create({
        data: {
          auctionId,
          createdById: sellerId,
          objective: planRow.objective,
          audience: planRow.audience,
          positioning: planRow.positioning,
          channels: channelsJson,
        },
      });
    } else {
      if (plan.createdById !== sellerId) {
        throw new Error("PLAN_FORBIDDEN");
      }
      plan = await tx.listingMarketingPlan.update({
        where: { id: plan.id },
        data: {
          objective: planRow.objective,
          audience: planRow.audience,
          positioning: planRow.positioning,
          channels: channelsJson,
        },
      });
    }

    const agg = await tx.listingMarketingTask.aggregate({
      where: { planId: plan.id },
      _max: { sortOrder: true },
    });
    let order = (agg._max.sortOrder ?? -1) + 1;

    for (const t of tasks) {
      await tx.listingMarketingTask.create({
        data: {
          planId: plan.id,
          title: t.title.startsWith("[AI] ") ? t.title : `[AI] ${t.title}`,
          description: t.description?.trim() ?? "",
          channel: t.channel ?? null,
          type: t.type ?? ListingMarketingTaskType.CHECKLIST,
          status: ListingMarketingTaskStatus.PENDING,
          sortOrder: order++,
        },
      });
    }

    for (const a of artifacts) {
      const channelKey = (a.channel ?? "").trim();
      const version = await nextArtifactVersion(tx, plan.id, a.type, channelKey);
      await tx.listingMarketingArtifact.create({
        data: {
          planId: plan.id,
          type: a.type,
          channel: channelKey,
          content: a.content,
          version,
        },
      });
    }

    return { planId: plan.id };
  });
}
