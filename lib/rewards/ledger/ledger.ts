import type { Prisma } from "@prisma/client";
import { WalletTransactionKind, WalletTransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { LedgerPostInput } from "@/lib/rewards/types";

function assertAmount(kind: WalletTransactionKind, amount: number) {
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    throw new Error("INVALID_AMOUNT");
  }
  if (amount === 0) throw new Error("INVALID_AMOUNT");
  // Convention: grants/releases are positive; debits/holds/expirations are negative.
  switch (kind) {
    case WalletTransactionKind.DEBIT:
    case WalletTransactionKind.HOLD:
    case WalletTransactionKind.EXPIRATION:
      if (amount > 0) throw new Error("INVALID_AMOUNT_SIGN");
      break;
    case WalletTransactionKind.GRANT:
    case WalletTransactionKind.RELEASE:
    case WalletTransactionKind.REDEMPTION:
    case WalletTransactionKind.ADMIN_ADJUSTMENT:
      if (amount < 0) throw new Error("INVALID_AMOUNT_SIGN");
      break;
    case WalletTransactionKind.REVERSAL:
      // Reversals can be either sign (they negate a prior txn).
      break;
    default:
      // Future-safe: reject unknown semantics until explicitly handled.
      throw new Error("INVALID_TXN_KIND");
  }
}

export async function postLedgerTransaction(input: LedgerPostInput) {
  assertAmount(input.kind, input.amount);

  const metadataJson = input.metadata as Prisma.InputJsonValue | undefined;
  return prisma.walletTransaction.create({
    data: {
      walletId: input.walletId,
      userId: input.userId,
      kind: input.kind,
      status: input.status ?? WalletTransactionStatus.POSTED,
      amount: input.amount,
      reasonCode: input.reasonCode ?? undefined,
      description: input.description ?? undefined,
      idempotencyKey: input.idempotencyKey ?? undefined,
      relatedEventId: input.relatedEventId ?? undefined,
      relatedTxnId: input.relatedTxnId ?? undefined,
      rewardCampaignId: input.rewardCampaignId ?? undefined,
      redemptionId: input.redemptionId ?? undefined,
      adminAdjustmentId: input.adminAdjustmentId ?? undefined,
      expiresAt: input.expiresAt ?? undefined,
      metadata: metadataJson,
    },
  });
}

/**
 * Reverse a prior posted transaction by creating a new REVERSAL entry referencing it.
 * This keeps the ledger immutable and auditable.
 */
export async function reverseLedgerTransaction(params: {
  txnId: string;
  actorUserId: string;
  reason: string;
}) {
  const prev = await prisma.walletTransaction.findUnique({
    where: { id: params.txnId },
    select: {
      id: true,
      walletId: true,
      userId: true,
      kind: true,
      status: true,
      amount: true,
      reasonCode: true,
    },
  });
  if (!prev) throw new Error("TXN_NOT_FOUND");
  if (prev.status !== WalletTransactionStatus.POSTED) throw new Error("TXN_NOT_POSTED");

  // Post reversal with opposite sign.
  const reversal = await prisma.walletTransaction.create({
    data: {
      walletId: prev.walletId,
      userId: prev.userId,
      kind: WalletTransactionKind.REVERSAL,
      status: WalletTransactionStatus.POSTED,
      amount: -prev.amount,
      reasonCode: prev.reasonCode ?? undefined,
      description: params.reason.slice(0, 300),
      relatedTxnId: prev.id,
      metadata: { actorUserId: params.actorUserId } as Prisma.InputJsonValue,
    },
  });

  await prisma.walletTransaction.update({
    where: { id: prev.id },
    data: { status: WalletTransactionStatus.REVERSED },
  });

  return reversal;
}

