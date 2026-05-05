import prisma from '@/lib/prisma';

const POST_WITH_FULL_RELATIONS = {
  author: true,
  media: true,
  cheers: true,
  comments: {
    include: { author: true },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

/**
 * Fetches approved posts for the global feed or a specific batch feed.
 * Batch activity is gated — only APPROVED users can see it.
 */
export async function getApprovedPosts(options?: {
  batchId?: string;
  requestingUserId?: string;
  requestingUserStatus?: string;
}) {
  const { batchId, requestingUserId, requestingUserStatus } = options ?? {};

  // Gate batch-specific activity
  if (batchId) {
    if (!requestingUserId) return []; // guests cannot see batch activity
    if (requestingUserStatus !== 'APPROVED') return []; // pending/rejected users blocked
  }

  const whereClause = batchId
    ? { status: 'APPROVED' as const, author: { batchId }, scope: 'BATCH' as const }
    : { status: 'APPROVED' as const, scope: 'GLOBAL' as const };

  return prisma.post.findMany({
    where: whereClause,
    include: POST_WITH_FULL_RELATIONS,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetches pending posts scoped by role and responsibility.
 * Admin -> GLOBAL posts only.
 * Batch Manager -> BATCH posts from their batch only.
 */
export async function getPendingPosts(options: {
  role: string;
  batchId?: string | null;
}) {
  const { role, batchId } = options;

  if (role === 'BATCH_MANAGER') {
    if (!batchId) return [];
    return prisma.post.findMany({
      where: { status: 'PENDING', author: { batchId }, scope: 'BATCH' },
      include: { author: true, media: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === 'ADMIN' || role === 'CO_ADMIN') {
    return prisma.post.findMany({
      where: { status: 'PENDING', scope: 'GLOBAL' },
      include: { author: true, media: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  return [];
}

/**
 * Fetches all posts authored by a specific user.
 */
export async function getMyPosts(userId: string) {
  return prisma.post.findMany({
    where: { authorId: userId },
    include: {
      media: true,
      _count: { select: { cheers: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetches recent activity (posts, cheers, comments) for a user.
 */
export async function getUserActivity(userId: string) {
  const [posts, cheers, comments] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.cheer.findMany({
      where: { userId },
      include: { post: { include: { media: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.comment.findMany({
      where: { authorId: userId },
      include: { post: { include: { media: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return { posts, cheers, comments };
}

/**
 * Fetches a single post by ID with all relations.
 */
export async function getPostById(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: POST_WITH_FULL_RELATIONS,
  });
}
