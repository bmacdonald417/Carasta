import { prisma } from "@/lib/db";
import { RewardReasonCode, RedemptionType, RewardRuleStatus } from "@prisma/client";

async function main() {
  // Reward rules (MVP defaults). Amounts are in whole Carasta Coin units.
  const rules: Array<{
    code: string;
    reasonCode: RewardReasonCode;
    amount: number;
    isHold: boolean;
    holdDays?: number;
  }> = [
    { code: "ACCOUNT_CREATED_V1", reasonCode: RewardReasonCode.ACCOUNT_CREATED, amount: 5, isHold: true, holdDays: 1 },
    { code: "PROFILE_VERIFIED_V1", reasonCode: RewardReasonCode.PROFILE_VERIFIED, amount: 25, isHold: false },
    { code: "KYC_COMPLETED_V1", reasonCode: RewardReasonCode.KYC_COMPLETED, amount: 100, isHold: true, holdDays: 7 },
    { code: "FIRST_LISTING_V1", reasonCode: RewardReasonCode.FIRST_LISTING, amount: 50, isHold: true, holdDays: 3 },
    { code: "SALE_COMPLETED_V1", reasonCode: RewardReasonCode.SALE_COMPLETED, amount: 250, isHold: true, holdDays: 14 },
    { code: "REFERRAL_ONBOARDING_V1", reasonCode: RewardReasonCode.REFERRAL_ONBOARDING, amount: 30, isHold: true, holdDays: 7 },
  ];

  for (const r of rules) {
    await prisma.rewardRule.upsert({
      where: { code: r.code },
      create: {
        code: r.code,
        status: RewardRuleStatus.ACTIVE,
        reasonCode: r.reasonCode,
        amount: r.amount,
        isHold: r.isHold,
        holdDays: r.holdDays ?? null,
      },
      update: {
        status: RewardRuleStatus.ACTIVE,
        amount: r.amount,
        isHold: r.isHold,
        holdDays: r.holdDays ?? null,
      },
    });
  }

  const options = [
    {
      code: "FEATURED_LISTING_BOOST_V1",
      type: RedemptionType.FEATURED_LISTING_BOOST,
      title: "Featured listing boost",
      description: "Highlight your listing in discovery surfaces for a limited time.",
      cost: 150,
    },
    {
      code: "SELLER_ANALYTICS_UNLOCK_V1",
      type: RedemptionType.SELLER_ANALYTICS_UNLOCK,
      title: "Seller analytics unlock",
      description: "Unlock deeper listing analytics for 30 days.",
      cost: 100,
    },
    {
      code: "PREMIUM_BADGE_V1",
      type: RedemptionType.PREMIUM_BADGE,
      title: "Premium profile badge",
      description: "A premium badge on your profile (cosmetic).",
      cost: 75,
    },
  ] as const;

  for (const o of options) {
    await prisma.redemptionOption.upsert({
      where: { code: o.code },
      create: { ...o, isActive: true },
      update: { ...o, isActive: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

