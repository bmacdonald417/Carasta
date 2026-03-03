/**
 * Reverts AuctionStatus enum to text if it exists.
 * Run before prisma db push to avoid data-loss error on Railway.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuctionStatus') THEN
          ALTER TABLE "Auction" ALTER COLUMN "status" DROP DEFAULT;
          ALTER TABLE "Auction" ALTER COLUMN "status" TYPE text USING "status"::text;
          DROP TYPE "AuctionStatus";
        END IF;
      END $$;
    `);
    console.log("Revert check complete.");
  } catch (e) {
    console.error("Revert script error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
