-- AlterTable
ALTER TABLE "User" ADD COLUMN "weeklyMarketingDigestOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "lastMarketingDigestSentAt" TIMESTAMP(3);
