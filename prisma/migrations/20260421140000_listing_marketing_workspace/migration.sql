-- CreateEnum
CREATE TYPE "ListingMarketingTaskStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ListingMarketingTaskType" AS ENUM ('CHECKLIST', 'REMINDER', 'MILESTONE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ListingMarketingArtifactType" AS ENUM ('CAPTION', 'HEADLINE', 'BODY', 'HASHTAGS', 'OTHER');

-- CreateTable
CREATE TABLE "ListingMarketingPlan" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT '',
    "positioning" TEXT NOT NULL DEFAULT '',
    "channels" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingMarketingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingMarketingTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" "ListingMarketingTaskType" NOT NULL DEFAULT 'CHECKLIST',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "channel" TEXT,
    "status" "ListingMarketingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ListingMarketingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingMarketingArtifact" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" "ListingMarketingArtifactType" NOT NULL DEFAULT 'OTHER',
    "channel" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingMarketingArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingMarketingPlan_auctionId_key" ON "ListingMarketingPlan"("auctionId");

-- CreateIndex
CREATE INDEX "ListingMarketingPlan_createdById_idx" ON "ListingMarketingPlan"("createdById");

-- CreateIndex
CREATE INDEX "ListingMarketingTask_planId_sortOrder_idx" ON "ListingMarketingTask"("planId", "sortOrder");

-- CreateIndex
CREATE INDEX "ListingMarketingArtifact_planId_createdAt_idx" ON "ListingMarketingArtifact"("planId", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingMarketingPlan" ADD CONSTRAINT "ListingMarketingPlan_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMarketingPlan" ADD CONSTRAINT "ListingMarketingPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMarketingTask" ADD CONSTRAINT "ListingMarketingTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ListingMarketingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMarketingArtifact" ADD CONSTRAINT "ListingMarketingArtifact_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ListingMarketingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
