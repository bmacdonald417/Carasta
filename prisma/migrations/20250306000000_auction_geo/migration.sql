-- AlterTable
ALTER TABLE "Auction" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Auction" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Auction" ADD COLUMN "locationZip" TEXT;

-- CreateIndex
CREATE INDEX "Auction_latitude_longitude_idx" ON "Auction"("latitude", "longitude");
