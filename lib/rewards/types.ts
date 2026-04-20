import type {
  RewardEventSource,
  RewardReasonCode,
  WalletTransactionKind,
  WalletTransactionStatus,
} from "@prisma/client";

/**
 * High-level event payload the app emits when something reward-worthy happens.
 * This is intentionally chain-agnostic and separate from ledger posting.
 */
export type RewardEventInput = {
  /** A stable idempotency key, unique per (userId, key). Required to prevent double-awards. */
  idempotencyKey: string;
  userId: string;
  source: RewardEventSource;
  reasonCode: RewardReasonCode;
  /** Optional listing context. */
  auctionId?: string | null;
  /** Optional campaign participation context. */
  rewardCampaignId?: string | null;
  /** Free-form metadata for audit + future fraud heuristics. */
  metadata?: Record<string, unknown>;
};

export type WalletSummary = {
  walletId: string;
  userId: string;
  balanceAvailable: number;
  balancePending: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
};

export type LedgerPostInput = {
  walletId: string;
  userId: string;
  kind: WalletTransactionKind;
  status?: WalletTransactionStatus;
  amount: number;
  reasonCode?: RewardReasonCode | null;
  description?: string | null;
  idempotencyKey?: string | null;
  relatedEventId?: string | null;
  relatedTxnId?: string | null;
  rewardCampaignId?: string | null;
  redemptionId?: string | null;
  adminAdjustmentId?: string | null;
  expiresAt?: Date | null;
  metadata?: Record<string, unknown> | null;
};

