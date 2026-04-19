-- Phase H — moderation workflow, soft hide, block/mute, report note + status enum (REVIEWED -> REVIEWING)

ALTER TABLE "DiscussionReport" ADD COLUMN "moderatorNote" TEXT;

CREATE TYPE "DiscussionReportStatus_new" AS ENUM ('OPEN', 'REVIEWING', 'ACTIONED', 'DISMISSED');

ALTER TABLE "DiscussionReport" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "DiscussionReport"
  ALTER COLUMN "status" TYPE "DiscussionReportStatus_new"
  USING (
    CASE "status"::text
      WHEN 'REVIEWED' THEN 'REVIEWING'::"DiscussionReportStatus_new"
      WHEN 'OPEN' THEN 'OPEN'::"DiscussionReportStatus_new"
      WHEN 'DISMISSED' THEN 'DISMISSED'::"DiscussionReportStatus_new"
      WHEN 'ACTIONED' THEN 'ACTIONED'::"DiscussionReportStatus_new"
      ELSE 'OPEN'::"DiscussionReportStatus_new"
    END
  );

ALTER TYPE "DiscussionReportStatus" RENAME TO "DiscussionReportStatus_old";
ALTER TYPE "DiscussionReportStatus_new" RENAME TO "DiscussionReportStatus";
DROP TYPE "DiscussionReportStatus_old";

ALTER TABLE "DiscussionReport" ALTER COLUMN "status" SET DEFAULT 'OPEN'::"DiscussionReportStatus";

ALTER TABLE "ForumThread" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ForumThread" ADD COLUMN "hiddenAt" TIMESTAMP(3);
ALTER TABLE "ForumThread" ADD COLUMN "hiddenById" TEXT;

ALTER TABLE "ForumThread"
  ADD CONSTRAINT "ForumThread_hiddenById_fkey"
  FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ForumReply" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ForumReply" ADD COLUMN "hiddenAt" TIMESTAMP(3);
ALTER TABLE "ForumReply" ADD COLUMN "hiddenById" TEXT;

ALTER TABLE "ForumReply"
  ADD CONSTRAINT "ForumReply_hiddenById_fkey"
  FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");
CREATE INDEX "UserBlock_blockerId_idx" ON "UserBlock"("blockerId");
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey"
  FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey"
  FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UserMute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mutedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserMute_userId_mutedUserId_key" ON "UserMute"("userId", "mutedUserId");
CREATE INDEX "UserMute_userId_idx" ON "UserMute"("userId");
CREATE INDEX "UserMute_mutedUserId_idx" ON "UserMute"("mutedUserId");

ALTER TABLE "UserMute" ADD CONSTRAINT "UserMute_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserMute" ADD CONSTRAINT "UserMute_mutedUserId_fkey"
  FOREIGN KEY ("mutedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
