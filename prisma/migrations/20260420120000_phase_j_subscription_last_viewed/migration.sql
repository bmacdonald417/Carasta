-- Phase J: lightweight “new since last view” for saved threads
ALTER TABLE "ForumThreadSubscription" ADD COLUMN "lastViewedAt" TIMESTAMP(3);
