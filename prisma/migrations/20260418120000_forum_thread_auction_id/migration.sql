-- Phase M: link discussion threads to auctions (additive, nullable FK).
ALTER TABLE "ForumThread" ADD COLUMN "auctionId" TEXT;

ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ForumThread_auctionId_idx" ON "ForumThread"("auctionId");
