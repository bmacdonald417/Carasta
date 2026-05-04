-- Add DISLIKE to DiscussionReactionKind enum for thread/reply vote system
-- DISLIKE is intentionally excluded from the emoji reaction picker UI —
-- it is only used by the ThreadVoteButton component (upvote/downvote).

ALTER TYPE "DiscussionReactionKind" ADD VALUE IF NOT EXISTS 'DISLIKE';
