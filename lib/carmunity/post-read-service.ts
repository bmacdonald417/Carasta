import { prisma } from "@/lib/db";

/**
 * Read-only Carmunity post payload for JSON/mobile clients.
 * Mirrors the explore post page include shape without HTML.
 */
export async function getCarmunityPostDetailJson(
  postId: string,
  viewerUserId: string | undefined
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, handle: true, name: true, avatarUrl: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, handle: true, name: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) return null;

  let liked = false;
  if (viewerUserId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: { userId: viewerUserId, postId },
      },
    });
    liked = !!like;
  }

  let viewerFollowsAuthor = false;
  if (viewerUserId && viewerUserId !== post.authorId) {
    const f = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerUserId,
          followingId: post.authorId,
        },
      },
    });
    viewerFollowsAuthor = !!f;
  }

  return {
    id: post.id,
    authorId: post.authorId,
    auctionId: post.auctionId,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    liked,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    viewerFollowsAuthor,
    comments: post.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
    })),
  };
}
