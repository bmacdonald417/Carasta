-- CreateEnum
CREATE TYPE "CollectorTier" AS ENUM ('NEW', 'VERIFIED', 'ELITE', 'APEX');

-- CreateEnum
CREATE TYPE "ReputationEventType" AS ENUM (
  'PAYMENT_VERIFIED',
  'DELIVERY_CONFIRMED',
  'PURCHASE_COMPLETED',
  'SALE_COMPLETED',
  'POSITIVE_FEEDBACK',
  'NEGATIVE_FEEDBACK',
  'CONDITION_REPORT_QUALITY',
  'DISPUTE_OPENED',
  'DISPUTE_LOST',
  'CHARGEBACK',
  'SELLER_CANCELLATION_AFTER_BID',
  'BUYER_NONPAYMENT',
  'POLICY_VIOLATION',
  'SOCIAL_HELPFUL_UPVOTE',
  'SOCIAL_SPAM_FLAG'
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "reputationScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "collectorTier" "CollectorTier" NOT NULL DEFAULT 'NEW';
ALTER TABLE "User" ADD COLUMN "reputationUpdatedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "completedSalesCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "completedPurchasesCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "disputesLostCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReputationEventType" NOT NULL,
    "points" INTEGER NOT NULL,
    "basePoints" INTEGER NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReputationEvent_userId_createdAt_idx" ON "ReputationEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReputationEvent_userId_type_idx" ON "ReputationEvent"("userId", "type");

-- AddForeignKey
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
