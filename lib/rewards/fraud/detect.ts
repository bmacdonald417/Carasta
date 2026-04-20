import type { RewardEventSource, RewardReasonCode } from "@prisma/client";

export type FraudDecision = "approve" | "hold" | "deny";

/**
 * Very lightweight MVP fraud detector.
 * Real logic will grow: IP/device clustering, referral graphs, anomaly baselines, etc.
 */
export async function detectFraudSignals(_input: {
  userId: string;
  reasonCode: RewardReasonCode;
  source: RewardEventSource;
  auctionId: string | null;
  metadata: Record<string, unknown>;
}): Promise<{ decision: FraudDecision; signals: string[] }> {
  // MVP: default allow.
  // Phase 2+ will add heuristics and return "hold"/"deny" for high-risk patterns.
  return { decision: "approve", signals: [] };
}

