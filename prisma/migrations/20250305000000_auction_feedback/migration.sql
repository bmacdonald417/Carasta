-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateTable
CREATE TABLE "AuctionFeedback" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "rating" "FeedbackRating" NOT NULL,
    "note" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionFeedback_auctionId_fromUserId_key" ON "AuctionFeedback"("auctionId", "fromUserId");

-- CreateIndex
CREATE INDEX "AuctionFeedback_toUserId_idx" ON "AuctionFeedback"("toUserId");

-- CreateIndex
CREATE INDEX "AuctionFeedback_auctionId_idx" ON "AuctionFeedback"("auctionId");

-- AddForeignKey
ALTER TABLE "AuctionFeedback" ADD CONSTRAINT "AuctionFeedback_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionFeedback" ADD CONSTRAINT "AuctionFeedback_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionFeedback" ADD CONSTRAINT "AuctionFeedback_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
