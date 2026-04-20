-- CreateTable
CREATE TABLE "MarketingCopilotRun" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "intakeJson" JSONB NOT NULL,
    "outputJson" JSONB NOT NULL,
    "inputHash" TEXT NOT NULL,
    "outputHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "MarketingCopilotRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingCopilotRun_createdById_createdAt_idx" ON "MarketingCopilotRun"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "MarketingCopilotRun_auctionId_createdAt_idx" ON "MarketingCopilotRun"("auctionId", "createdAt");

-- AddForeignKey
ALTER TABLE "MarketingCopilotRun" ADD CONSTRAINT "MarketingCopilotRun_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCopilotRun" ADD CONSTRAINT "MarketingCopilotRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
