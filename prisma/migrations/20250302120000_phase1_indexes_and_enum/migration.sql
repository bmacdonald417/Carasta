-- Phase 1 indexes only (enum reverted for db push compatibility)
-- Indexes created by db push; this file for migrate deploy reference
CREATE INDEX IF NOT EXISTS "Auction_status_endAt_idx" ON "Auction"("status", "endAt");
CREATE INDEX IF NOT EXISTS "Auction_status_createdAt_idx" ON "Auction"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
