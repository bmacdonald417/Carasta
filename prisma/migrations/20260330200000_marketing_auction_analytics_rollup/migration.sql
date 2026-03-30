-- AlterEnum: marketing traffic source (LinkedIn tracked links + UTM)
ALTER TYPE "MarketingTrafficSource" ADD VALUE 'LINKEDIN';

-- CreateTable
CREATE TABLE "AuctionAnalytics" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shareClicks" INTEGER NOT NULL DEFAULT 0,
    "lastEventAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionAnalytics_auctionId_day_key" ON "AuctionAnalytics"("auctionId", "day");

-- CreateIndex
CREATE INDEX "AuctionAnalytics_auctionId_idx" ON "AuctionAnalytics"("auctionId");

-- AddForeignKey
ALTER TABLE "AuctionAnalytics" ADD CONSTRAINT "AuctionAnalytics_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
