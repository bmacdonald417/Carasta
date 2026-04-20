-- Phase I — thread subscriptions (saved / followed threads)

CREATE TABLE "ForumThreadSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumThreadSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumThreadSubscription_userId_threadId_key" ON "ForumThreadSubscription"("userId", "threadId");
CREATE INDEX "ForumThreadSubscription_userId_idx" ON "ForumThreadSubscription"("userId");
CREATE INDEX "ForumThreadSubscription_threadId_idx" ON "ForumThreadSubscription"("threadId");

ALTER TABLE "ForumThreadSubscription" ADD CONSTRAINT "ForumThreadSubscription_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ForumThreadSubscription" ADD CONSTRAINT "ForumThreadSubscription_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
