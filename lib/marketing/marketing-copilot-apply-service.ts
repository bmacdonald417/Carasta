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

function priorityActionToTask(
  action: MarketingCopilotStructuredResult["priorityActions"][number]
) {
  return {
    title: action.title,
    description: [action.actionNow, action.whyThisMatters].filter(Boolean).join("\n\nWhy now:\n"),
    channel: action.channel ?? null,
    type:
      action.tone === "urgency"
        ? ListingMarketingTaskType.REMINDER
        : ListingMarketingTaskType.CHECKLIST,
  };
}

function buildStrategyArtifacts(
  copilot: MarketingCopilotStructuredResult
): MarketingCopilotStructuredResult["artifacts"] {
  const artifacts: MarketingCopilotStructuredResult["artifacts"] = [];

  if (copilot.watchouts.length > 0) {
    artifacts.push({
      type: ListingMarketingArtifactType.OTHER,
      channel: "strategy_watchouts",
      content: [
        "Watchouts",
        ...copilot.watchouts.map((w) => `- ${w.title}: ${w.detail}`),
      ].join("\n"),
    });
  }

  if (copilot.measurementPlan.length > 0) {
    artifacts.push({
      type: ListingMarketingArtifactType.OTHER,
      channel: "measurement_plan",
      content: [
        "Measurement plan",
        ...copilot.measurementPlan.map(
          (m) =>
            `- ${m.metric}: ${m.whyThisMatters}${
              m.targetSignal ? ` (target signal: ${m.targetSignal})` : ""
            }`
        ),
      ].join("\n"),
    });
  }

  for (const playbook of copilot.channelPlaybooks) {
    artifacts.push({
      type: ListingMarketingArtifactType.OTHER,
      channel: `playbook_${playbook.channel}`.slice(0, 64),
      content: [
        `Channel playbook: ${playbook.channel}`,
        `Audience fit: ${playbook.audienceFit}`,
        `Why this channel: ${playbook.whyThisChannel}`,
        `Cadence: ${playbook.cadence}`,
        `Messaging angle: ${playbook.messagingAngle}`,
        `CTA guidance: ${playbook.ctaGuidance}`,
        playbook.assetSuggestions.length
          ? `Asset suggestions:\n${playbook.assetSuggestions.map((v) => `- ${v}`).join("\n")}`
          : "",
        playbook.doNotes.length
          ? `Do:\n${playbook.doNotes.map((v) => `- ${v}`).join("\n")}`
          : "",
        playbook.avoidNotes.length
          ? `Avoid:\n${playbook.avoidNotes.map((v) => `- ${v}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }

  return artifacts;
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
  priorityActions?: MarketingCopilotStructuredResult["priorityActions"];
  channelPlaybooks?: MarketingCopilotStructuredResult["channelPlaybooks"];
  watchouts?: MarketingCopilotStructuredResult["watchouts"];
  measurementPlan?: MarketingCopilotStructuredResult["measurementPlan"];
}): Promise<{ planId: string }> {
  const {
    sellerId,
    auctionId,
    planRow,
    tasks,
    artifacts,
    priorityActions = [],
    channelPlaybooks = [],
    watchouts = [],
    measurementPlan = [],
  } = params;

  const auction = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: { id: true },
  });
  if (!auction) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const channelsJson = planRow.channels as unknown as Prisma.InputJsonValue;
  const strategyArtifacts = buildStrategyArtifacts({
    plan: {
      objective: planRow.objective,
      audience: planRow.audience,
      positioning: planRow.positioning,
      channels: planRow.channels,
      summaryStrategy: "",
      whyNow: "",
      workflowMode: "launch",
    },
    priorityActions,
    channelPlaybooks,
    tasks,
    artifacts,
    watchouts,
    measurementPlan,
  });

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
    const taskTitles = new Set<string>();

    for (const t of tasks) {
      taskTitles.add(t.title.trim().toLowerCase());
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

    for (const action of priorityActions) {
      const mapped = priorityActionToTask(action);
      const key = mapped.title.trim().toLowerCase();
      if (!key || taskTitles.has(key)) continue;
      taskTitles.add(key);
      await tx.listingMarketingTask.create({
        data: {
          planId: plan.id,
          title: mapped.title.startsWith("[AI] ") ? mapped.title : `[AI] ${mapped.title}`,
          description: mapped.description,
          channel: mapped.channel,
          type: mapped.type,
          status: ListingMarketingTaskStatus.PENDING,
          sortOrder: order++,
        },
      });
    }

    for (const a of [...artifacts, ...strategyArtifacts]) {
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
