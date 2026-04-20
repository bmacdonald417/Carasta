import { RewardEventSource, RewardEventStatus, WalletTransactionKind } from "@prisma/client";
import type { RewardEventInput } from "@/lib/rewards/types";
import { prisma } from "@/lib/db";
import { createWalletIfMissing } from "@/lib/rewards/ledger/wallet";
import { evaluateRewardRules } from "@/lib/rewards/rules/evaluate";
import { postLedgerTransaction } from "@/lib/rewards/ledger/ledger";
import { detectFraudSignals } from "@/lib/rewards/fraud/detect";

/**
 * Main entrypoint: accept a reward-worthy event, enforce idempotency, evaluate rules,
 * optionally hold/deny, and post ledger transactions.
 */
export async function awardCreditsForEvent(input: RewardEventInput) {
  if (!input.userId) throw new Error("USER_ID_REQUIRED");
  if (!input.idempotencyKey) throw new Error("IDEMPOTENCY_KEY_REQUIRED");

  // Fast path: if event already exists, return it.
  const existing = await prisma.rewardEvent.findUnique({
    where: { userId_idempotencyKey: { userId: input.userId, idempotencyKey: input.idempotencyKey } },
    select: { id: true, status: true },
  });
  if (existing) return { ok: true as const, eventId: existing.id, status: existing.status };

  const wallet = await createWalletIfMissing(input.userId);

  const fraud = await detectFraudSignals({
    userId: input.userId,
    reasonCode: input.reasonCode,
    source: input.source ?? RewardEventSource.SYSTEM,
    auctionId: input.auctionId ?? null,
    metadata: input.metadata ?? {},
  });
  if (fraud.decision === "deny") {
    const ev = await prisma.rewardEvent.create({
      data: {
        userId: input.userId,
        source: input.source,
        reasonCode: input.reasonCode,
        status: RewardEventStatus.DENIED,
        idempotencyKey: input.idempotencyKey,
        auctionId: input.auctionId ?? undefined,
        rewardCampaignId: input.rewardCampaignId ?? undefined,
        metadata: { ...input.metadata, fraud } as any,
        decidedAt: new Date(),
      },
      select: { id: true, status: true },
    });
    return { ok: true as const, eventId: ev.id, status: ev.status };
  }

  const ruleEval = await evaluateRewardRules({
    userId: input.userId,
    reasonCode: input.reasonCode,
    now: new Date(),
  });

  const shouldHold = fraud.decision === "hold" || ruleEval.hold === true;
  const status = shouldHold ? RewardEventStatus.HELD : RewardEventStatus.AWARDED;

  const ev = await prisma.rewardEvent.create({
    data: {
      userId: input.userId,
      source: input.source,
      reasonCode: input.reasonCode,
      status,
      idempotencyKey: input.idempotencyKey,
      ruleId: ruleEval.ruleId ?? undefined,
      rewardCampaignId: input.rewardCampaignId ?? undefined,
      auctionId: input.auctionId ?? undefined,
      metadata: { ...input.metadata, fraud, ruleEval } as any,
      decidedAt: new Date(),
    },
    select: { id: true, status: true },
  });

  if (!ruleEval.amount || ruleEval.amount <= 0) {
    return { ok: true as const, eventId: ev.id, status: ev.status };
  }

  const kind = shouldHold ? WalletTransactionKind.HOLD : WalletTransactionKind.GRANT;
  const amount = shouldHold ? -ruleEval.amount : ruleEval.amount;

  await postLedgerTransaction({
    walletId: wallet.id,
    userId: input.userId,
    kind,
    amount,
    reasonCode: input.reasonCode,
    idempotencyKey: `evt:${ev.id}:${kind}`,
    relatedEventId: ev.id,
    rewardCampaignId: input.rewardCampaignId ?? null,
    metadata: { source: input.source } as any,
  });

  return { ok: true as const, eventId: ev.id, status: ev.status };
}

