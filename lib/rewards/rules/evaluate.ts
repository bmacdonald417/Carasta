import { RewardRuleStatus, type RewardReasonCode } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function evaluateRewardRules(params: {
  userId: string;
  reasonCode: RewardReasonCode;
  now: Date;
}): Promise<{ ruleId: string | null; amount: number; hold: boolean }> {
  const rule = await prisma.rewardRule.findFirst({
    where: {
      status: RewardRuleStatus.ACTIVE,
      reasonCode: params.reasonCode,
      OR: [{ startsAt: null }, { startsAt: { lte: params.now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: params.now } }] }],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, amount: true, isHold: true },
  });

  if (!rule) return { ruleId: null, amount: 0, hold: false };
  return { ruleId: rule.id, amount: rule.amount, hold: rule.isHold };
}

