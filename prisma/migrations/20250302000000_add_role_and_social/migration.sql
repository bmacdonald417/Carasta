-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "twitterUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "tiktokUrl" TEXT;
