-- AddColumn
ALTER TABLE "Conversation" ADD COLUMN "auctionId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_auctionId_idx" ON "Conversation"("auctionId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

