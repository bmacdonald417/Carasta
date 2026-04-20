-- Carasta Coin (centralized rewards ledger) — foundation tables.

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceAvailable" INTEGER NOT NULL DEFAULT 0,
    "balancePending" INTEGER NOT NULL DEFAULT 0,
    "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,
    "lifetimeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reasonCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "isHold" BOOLEAN NOT NULL DEFAULT false,
    "holdDays" INTEGER,
    "maxAwardsPerUser" INTEGER,
    "cooldownSeconds" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardCampaign" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardCampaignParticipation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "RewardCampaignParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "reasonCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "idempotencyKey" TEXT NOT NULL,
    "ruleId" TEXT,
    "rewardCampaignId" TEXT,
    "auctionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "RewardEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedemptionOption" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedemptionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedemptionRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "cost" INTEGER NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "RedemptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralRelationship" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "referralCodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "ReferralRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudFlag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "FraudFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAdjustment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CARASTA_COIN',
    "reasonCode" TEXT,
    "description" VARCHAR(300),
    "idempotencyKey" TEXT,
    "relatedEventId" TEXT,
    "relatedTxnId" TEXT,
    "rewardCampaignId" TEXT,
    "redemptionId" TEXT,
    "adminAdjustmentId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- Indexes + uniques
CREATE UNIQUE INDEX "UserWallet_userId_key" ON "UserWallet"("userId");
CREATE INDEX "UserWallet_userId_idx" ON "UserWallet"("userId");

CREATE UNIQUE INDEX "RewardRule_code_key" ON "RewardRule"("code");
CREATE INDEX "RewardRule_status_idx" ON "RewardRule"("status");
CREATE INDEX "RewardRule_reasonCode_idx" ON "RewardRule"("reasonCode");

CREATE UNIQUE INDEX "RewardCampaign_code_key" ON "RewardCampaign"("code");
CREATE INDEX "RewardCampaign_status_idx" ON "RewardCampaign"("status");

CREATE UNIQUE INDEX "RewardCampaignParticipation_campaignId_userId_key" ON "RewardCampaignParticipation"("campaignId","userId");
CREATE INDEX "RewardCampaignParticipation_userId_joinedAt_idx" ON "RewardCampaignParticipation"("userId","joinedAt");

CREATE UNIQUE INDEX "RewardEvent_userId_idempotencyKey_key" ON "RewardEvent"("userId","idempotencyKey");
CREATE INDEX "RewardEvent_userId_createdAt_idx" ON "RewardEvent"("userId","createdAt");
CREATE INDEX "RewardEvent_reasonCode_createdAt_idx" ON "RewardEvent"("reasonCode","createdAt");
CREATE INDEX "RewardEvent_status_createdAt_idx" ON "RewardEvent"("status","createdAt");

CREATE UNIQUE INDEX "RedemptionOption_code_key" ON "RedemptionOption"("code");
CREATE INDEX "RedemptionOption_isActive_idx" ON "RedemptionOption"("isActive");
CREATE INDEX "RedemptionOption_type_idx" ON "RedemptionOption"("type");

CREATE INDEX "RedemptionRecord_userId_createdAt_idx" ON "RedemptionRecord"("userId","createdAt");
CREATE INDEX "RedemptionRecord_status_createdAt_idx" ON "RedemptionRecord"("status","createdAt");

CREATE UNIQUE INDEX "ReferralCode_userId_key" ON "ReferralCode"("userId");
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");

CREATE UNIQUE INDEX "ReferralRelationship_referredId_key" ON "ReferralRelationship"("referredId");
CREATE UNIQUE INDEX "ReferralRelationship_referrerId_referredId_key" ON "ReferralRelationship"("referrerId","referredId");
CREATE INDEX "ReferralRelationship_referrerId_createdAt_idx" ON "ReferralRelationship"("referrerId","createdAt");

CREATE INDEX "FraudFlag_userId_createdAt_idx" ON "FraudFlag"("userId","createdAt");
CREATE INDEX "FraudFlag_status_createdAt_idx" ON "FraudFlag"("status","createdAt");

CREATE INDEX "AdminAdjustment_userId_createdAt_idx" ON "AdminAdjustment"("userId","createdAt");
CREATE INDEX "AdminAdjustment_actorId_createdAt_idx" ON "AdminAdjustment"("actorId","createdAt");

CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId","createdAt");
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId","createdAt");
CREATE INDEX "WalletTransaction_kind_createdAt_idx" ON "WalletTransaction"("kind","createdAt");
CREATE INDEX "WalletTransaction_relatedEventId_idx" ON "WalletTransaction"("relatedEventId");
CREATE UNIQUE INDEX "WalletTransaction_userId_idempotencyKey_key" ON "WalletTransaction"("userId","idempotencyKey");

-- Foreign keys
ALTER TABLE "UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "RewardRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_rewardCampaignId_fkey" FOREIGN KEY ("rewardCampaignId") REFERENCES "RewardCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RewardCampaignParticipation" ADD CONSTRAINT "RewardCampaignParticipation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "RewardCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardCampaignParticipation" ADD CONSTRAINT "RewardCampaignParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RedemptionRecord" ADD CONSTRAINT "RedemptionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RedemptionRecord" ADD CONSTRAINT "RedemptionRecord_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "UserWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RedemptionRecord" ADD CONSTRAINT "RedemptionRecord_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "RedemptionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralRelationship" ADD CONSTRAINT "ReferralRelationship_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FraudFlag" ADD CONSTRAINT "FraudFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FraudFlag" ADD CONSTRAINT "FraudFlag_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminAdjustment" ADD CONSTRAINT "AdminAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminAdjustment" ADD CONSTRAINT "AdminAdjustment_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "UserWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "RewardEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_relatedTxnId_fkey" FOREIGN KEY ("relatedTxnId") REFERENCES "WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_rewardCampaignId_fkey" FOREIGN KEY ("rewardCampaignId") REFERENCES "RewardCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "RedemptionRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_adminAdjustmentId_fkey" FOREIGN KEY ("adminAdjustmentId") REFERENCES "AdminAdjustment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

