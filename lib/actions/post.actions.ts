'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { saveFile, deleteFile } from '@/lib/utils/upload';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────
// Post CRUD
// ─────────────────────────────────────────

export async function createPost(prevState: any, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'You must be logged in to create a post.' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const scope = (formData.get('scope') as 'GLOBAL' | 'BATCH') || 'GLOBAL';
    const imageFiles = formData.getAll('imageFiles') as File[];
    const videoFiles = formData.getAll('videoFiles') as File[];

    if (!content) return { error: 'Post content is required.' };
    if (imageFiles.length + videoFiles.length > 50) {
      return { error: 'You can upload a maximum of 50 files per post.' };
    }

    const mediaData: { type: 'IMAGE' | 'VIDEO'; url: string }[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return { error: `Image "${file.name}" exceeds the 10MB limit.` };
        }
        const url = await saveFile(file, 'posts');
        mediaData.push({ type: 'IMAGE', url });
      }
    }

    for (const file of videoFiles) {
      if (file && file.size > 0) {
        if (file.size > 1024 * 1024 * 1024) {
          return { error: `Video "${file.name}" exceeds the 1GB limit.` };
        }
        const url = await saveFile(file, 'posts');
        mediaData.push({ type: 'VIDEO', url });
      }
    }

    await prisma.post.create({
      data: {
        title: title || null,
        content,
        authorId: user.uid,
        status: 'PENDING',
        scope,
        media: { create: mediaData },
      },
    });

    if (scope === 'GLOBAL') {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'CO_ADMIN'] } },
        select: { id: true },
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'New Global Post Pending Approval',
            message: `A new global post ${title ? `"${title}" ` : ''}requires your approval.`,
            link: '/admin/posts',
          })),
        });
      }
    } else if (scope === 'BATCH' && user.batchId) {
      const batchManagers = await prisma.user.findMany({
        where: { role: 'BATCH_MANAGER', batchId: user.batchId },
        select: { id: true },
      });
      if (batchManagers.length > 0) {
        await prisma.notification.createMany({
          data: batchManagers.map(manager => ({
            userId: manager.id,
            title: 'New Batch Post Pending Approval',
            message: `A new batch post ${title ? `"${title}" ` : ''}requires your approval.`,
            link: '/dashboard/manage-batch',
          })),
        });
      }
    }

    revalidatePath('/dashboard/posts/my-posts');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('[createPost]', error);
    return { error: 'Failed to create post. Please try again.' };
  }
}

export async function editPostAction(postId: string, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const removedMediaIds = formData.getAll('removedMediaIds') as string[];
    const imageFiles = formData.getAll('imageFiles') as File[];
    const videoFiles = formData.getAll('videoFiles') as File[];

    if (!content?.trim()) return { error: 'Post content is required.' };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) return { error: 'Post not found.' };

    const isAuthorized =
      user.role === 'ADMIN' || user.role === 'CO_ADMIN' || user.uid === post.authorId;
    if (!isAuthorized) return { error: 'Unauthorized. You can only edit your own posts.' };

    // Remove media
    if (removedMediaIds.length > 0) {
      const mediaToRemove = post.media.filter((m) => removedMediaIds.includes(m.id));
      await Promise.all(mediaToRemove.map((m) => deleteFile(m.url)));
      await prisma.media.deleteMany({ where: { id: { in: removedMediaIds }, postId } });
    }

    // Add new media
    const mediaData: { type: 'IMAGE' | 'VIDEO'; url: string }[] = [];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) return { error: `Image "${file.name}" exceeds 10MB limit.` };
        mediaData.push({ type: 'IMAGE', url: await saveFile(file, 'posts') });
      }
    }
    for (const file of videoFiles) {
      if (file && file.size > 0) {
        if (file.size > 1024 * 1024 * 1024) return { error: `Video "${file.name}" exceeds 1GB limit.` };
        mediaData.push({ type: 'VIDEO', url: await saveFile(file, 'posts') });
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data: { title: title || null, content, media: { create: mediaData } },
    });

    revalidatePath('/dashboard/posts/my-posts');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('[editPostAction]', error);
    return { error: 'Failed to edit post.' };
  }
}

export async function deletePostAction(postId: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) return { error: 'Post not found.' };

    const isAuthorized =
      user.role === 'ADMIN' || user.role === 'CO_ADMIN' || user.uid === post.authorId;
    if (!isAuthorized) return { error: 'Unauthorized. You can only delete your own posts.' };

    // Delete physical media files
    await Promise.all(post.media.map((m) => deleteFile(m.url)));

    await prisma.post.delete({ where: { id: postId } });

    revalidatePath('/dashboard/posts/my-posts');
    revalidatePath('/admin/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('[deletePostAction]', error);
    return { error: 'Failed to delete post.' };
  }
}

// ─────────────────────────────────────────
// Post Moderation
// ─────────────────────────────────────────

/**
 * Authorization helper for moderating posts.
 * Admins/Co-Admins -> GLOBAL posts only.
 * Batch Managers -> BATCH posts from their batch only.
 */
async function isAuthorizedModerator(userId: string, role: string, postAuthorBatchId: string | null, postScope: string) {
  if (role === 'ADMIN' || role === 'CO_ADMIN') {
    return postScope === 'GLOBAL';
  }
  if (role === 'BATCH_MANAGER') {
    if (postScope !== 'BATCH') return false;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    return dbUser?.batchId === postAuthorBatchId;
  }
  return false;
}

export async function approvePost(postId: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Unauthorized.' };

    const post = await prisma.post.findUnique({ where: { id: postId }, include: { author: true } });
    if (!post) return { error: 'Post not found.' };

    const authorized = await isAuthorizedModerator(user.uid, user.role, post.author.batchId, post.scope);
    if (!authorized) return { error: 'Unauthorized.' };

    await prisma.post.update({ where: { id: postId }, data: { status: 'APPROVED' } });

    const scopeName = post.scope === 'GLOBAL' ? 'global' : 'batch';
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: 'Post Approved',
        message: `Your ${scopeName} post ${post.title ? `"${post.title}" ` : ''}has been approved.`,
        link: '/dashboard/posts/my-posts',
      },
    });

    revalidatePath('/admin/posts');
    revalidatePath('/dashboard/manage-batch');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('[approvePost]', error);
    return { error: 'Failed to approve post.' };
  }
}

export async function rejectPost(postId: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Unauthorized.' };

    const post = await prisma.post.findUnique({ 
      where: { id: postId }, 
      include: { author: true, media: true } 
    });
    if (!post) return { error: 'Post not found.' };

    const authorized = await isAuthorizedModerator(user.uid, user.role, post.author.batchId, post.scope);
    if (!authorized) return { error: 'Unauthorized.' };

    // 1. Delete physical media files from disk
    if (post.media.length > 0) {
      await Promise.all(post.media.map(m => deleteFile(m.url)));
      // 2. Remove media records from DB
      await prisma.media.deleteMany({ where: { postId } });
    }

    // 3. Update status to REJECTED
    await prisma.post.update({ where: { id: postId }, data: { status: 'REJECTED' } });

    const scopeName = post.scope === 'GLOBAL' ? 'global' : 'batch';
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: 'Post Rejected',
        message: `Your ${scopeName} post ${post.title ? `"${post.title}" ` : ''}has been rejected.`,
        link: '/dashboard/posts/my-posts',
      },
    });

    revalidatePath('/admin/posts');
    revalidatePath('/dashboard/manage-batch');

    return { success: true };
  } catch (error) {
    console.error('[rejectPost]', error);
    return { error: 'Failed to reject post.' };
  }
}

// ─────────────────────────────────────────
// Feed Interactions
// ─────────────────────────────────────────

export async function toggleCheer(postId: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const existing = await prisma.cheer.findUnique({
      where: { postId_userId: { postId, userId: user.uid } },
    });

    if (existing) {
      await prisma.cheer.delete({ where: { id: existing.id } });
    } else {
      await prisma.cheer.create({ data: { postId, userId: user.uid } });

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post && post.authorId !== user.uid) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            title: 'New Cheer',
            message: `${user.name || 'Someone'} cheered your post${post.title ? ` "${post.title}"` : ''}.`,
            link: '/feed',
          },
        });
      }
    }

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('[toggleCheer]', error);
    return { error: 'Failed to update cheer.' };
  }
}

export async function addComment(postId: string, content: string) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };
    if (!content?.trim()) return { error: 'Comment cannot be empty.' };

    await prisma.comment.create({ data: { content, postId, authorId: user.uid } });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId !== user.uid) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          title: 'New Comment',
          message: `${user.name || 'Someone'} commented on your post${post.title ? ` "${post.title}"` : ''}.`,
          link: '/feed',
        },
      });
    }

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('[addComment]', error);
    return { error: 'Failed to add comment.' };
  }
}

// ─────────────────────────────────────────
// Auth-Aware Query Wrappers
// (Maintain backward compat — callers use zero-arg API)
// ─────────────────────────────────────────

import {
  getApprovedPosts as _getApprovedPosts,
  getPendingPosts as _getPendingPosts,
  getMyPosts as _getMyPosts,
  getUserActivity as _getUserActivity,
  getPostById as _getPostById,
} from '@/lib/db/posts.db';

/**
 * Returns a single post by ID.
 */
export async function getPostByIdAction(postId: string) {
  return _getPostById(postId);
}

/**
 * Returns approved posts. Batch activity is gated to APPROVED users only.
 */
export async function getApprovedPosts(batchId?: string) {
  const user = await getServerUser();
  return _getApprovedPosts({
    batchId,
    requestingUserId: user?.uid,
    requestingUserStatus: user?.status,
  });
}

/**
 * Returns pending posts scoped by the calling user's role.
 */
export async function getPendingPosts() {
  const user = await getServerUser();
  if (!user) return [];
  const batchId =
    user.role === 'BATCH_MANAGER' ? user.batchId : undefined;
  return _getPendingPosts({ role: user.role, batchId });
}

/**
 * Returns the calling user's own posts.
 */
export async function getMyPosts() {
  const user = await getServerUser();
  if (!user) return [];
  return _getMyPosts(user.uid);
}

/**
 * Returns recent activity for the calling user.
 */
export async function getUserActivity() {
  const user = await getServerUser();
  if (!user) return null;
  return _getUserActivity(user.uid);
}
