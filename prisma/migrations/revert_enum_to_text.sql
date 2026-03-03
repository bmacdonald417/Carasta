-- Revert AuctionStatus enum to text (for db push compatibility)
-- Idempotent: safe to run on DBs that never had the enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuctionStatus') THEN
    ALTER TABLE "Auction" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "Auction" ALTER COLUMN "status" TYPE text USING "status"::text;
    DROP TYPE "AuctionStatus";
  END IF;
END $$;
