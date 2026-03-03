-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'LIVE', 'SOLD', 'ENDED');

-- AlterTable: Convert Auction.status from TEXT to AuctionStatus
ALTER TABLE "Auction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Auction" ALTER COLUMN "status" TYPE "AuctionStatus" USING "status"::"AuctionStatus";
ALTER TABLE "Auction" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Auction_status_endAt_idx" ON "Auction"("status", "endAt");

-- CreateIndex
CREATE INDEX "Auction_status_createdAt_idx" ON "Auction"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
