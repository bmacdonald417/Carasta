-- AlterTable
ALTER TABLE "Post" ADD COLUMN "auctionId" TEXT;

-- CreateIndex
CREATE INDEX "Post_auctionId_idx" ON "Post"("auctionId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
