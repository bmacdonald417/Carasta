-- Listing copy AI audit trail (sell wizard / optional auction scope).

CREATE TABLE "ListingAiRun" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "auctionId" TEXT,
    "intakeJson" JSONB NOT NULL,
    "outputJson" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingAiRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ListingAiRun_createdById_createdAt_idx" ON "ListingAiRun"("createdById", "createdAt");
CREATE INDEX "ListingAiRun_auctionId_createdAt_idx" ON "ListingAiRun"("auctionId", "createdAt");

ALTER TABLE "ListingAiRun" ADD CONSTRAINT "ListingAiRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingAiRun" ADD CONSTRAINT "ListingAiRun_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
