-- CreateEnum
CREATE TYPE "ConditionGrade" AS ENUM ('CONCOURS', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR');

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN "conditionGrade" "ConditionGrade";
ALTER TABLE "Auction" ADD COLUMN "conditionSummary" TEXT;
ALTER TABLE "Auction" ADD COLUMN "imperfections" JSONB;

-- CreateTable
CREATE TABLE "AuctionDamageImage" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionDamageImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuctionDamageImage_auctionId_idx" ON "AuctionDamageImage"("auctionId");

-- AddForeignKey
ALTER TABLE "AuctionDamageImage" ADD CONSTRAINT "AuctionDamageImage_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
