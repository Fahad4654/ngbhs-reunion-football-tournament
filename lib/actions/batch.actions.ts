'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/lib/utils/upload';

// ─────────────────────────────────────────
// Batch Queries
// ─────────────────────────────────────────

export async function getAllBatches() {
  try {
    return await prisma.batch.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    console.error('[getAllBatches]', error);
    return [];
  }
}

export async function getPendingBatchMembers() {
  try {
    const user = await getServerUser();
    if (user?.role !== 'BATCH_MANAGER') return [];

    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (!dbUser?.batchId) return [];

    return await prisma.user.findMany({
      where: { batchId: dbUser.batchId, status: 'PENDING', emailVerified: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('[getPendingBatchMembers]', error);
    return [];
  }
}

// ─────────────────────────────────────────
// Admin Batch CRUD
// ─────────────────────────────────────────

function generateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function createBatch(data: {
  year: number;
  nickname?: string;
  logoUrl?: string;
  slogan?: string;
}) {
  const user = await getServerUser();
  if (user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' };

  const name = `Batch ${data.year}`;

  try {
    const batch = await prisma.batch.create({
      data: {
        name,
        slug: generateSlug(name),
        year: data.year,
        nickname: data.nickname?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        slogan: data.slogan?.trim() || null,
      },
    });
    revalidatePath('/admin/batches');
    revalidatePath('/admin/tournaments');
    return { success: true, data: batch };
  } catch (error: any) {
    console.error('[createBatch]', error);
    if (error.code === 'P2002') return { success: false, error: 'A batch for that year already exists' };
    return { success: false, error: 'Failed to create batch' };
  }
}

/** Admin-only: can update any field including name */
export async function updateBatch(id: string, data: {
  nickname?: string;
  logoUrl?: string;
  slogan?: string;
}) {
  const user = await getServerUser();
  if (user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' };

  try {
    const oldBatch = await prisma.batch.findUnique({ where: { id }, select: { logoUrl: true } });

    const batch = await prisma.batch.update({
      where: { id },
      data: {
        nickname: data.nickname?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        slogan: data.slogan?.trim() || null,
      },
    });

    if (oldBatch?.logoUrl && oldBatch.logoUrl !== data.logoUrl) {
      await deleteFile(oldBatch.logoUrl);
    }
    revalidatePath('/admin/batches');
    return { success: true, data: batch };
  } catch (error: any) {
    console.error('[updateBatch]', error);
    return { success: false, error: 'Failed to update batch' };
  }
}

/** Batch Manager: can edit nickname, logo, slogan — NOT year */
export async function updateBatchProfile(data: {
  nickname?: string;
  logoUrl?: string;
  slogan?: string;
}) {
  const user = await getServerUser();
  if (user?.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { success: false, error: 'No batch assigned' };

  try {
    const oldBatch = await prisma.batch.findUnique({ where: { id: dbUser.batchId }, select: { logoUrl: true } });

    const batch = await prisma.batch.update({
      where: { id: dbUser.batchId },
      data: {
        nickname: data.nickname?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        slogan: data.slogan?.trim() || null,
      },
    });

    if (oldBatch?.logoUrl && oldBatch.logoUrl !== data.logoUrl) {
      await deleteFile(oldBatch.logoUrl);
    }
    revalidatePath('/dashboard/manage-batch');
    return { success: true, data: batch };
  } catch (error: any) {
    console.error('[updateBatchProfile]', error);
    return { success: false, error: 'Failed to update batch profile' };
  }
}

export async function deleteBatch(id: string) {
  const user = await getServerUser();
  if (user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' };

  try {
    const batch = await prisma.batch.findUnique({ where: { id }, select: { logoUrl: true } });
    if (batch?.logoUrl) {
      await deleteFile(batch.logoUrl);
    }
    
    await prisma.batch.delete({ where: { id } });
    revalidatePath('/admin/batches');
    revalidatePath('/standings');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteBatch]', error);
    return { success: false, error: 'Cannot delete this batch — it may have related matches or members' };
  }
}

// ─────────────────────────────────────────
// Batch Manager Actions
// ─────────────────────────────────────────

export async function toggleTeamMember(userId: string, isPlayer: boolean) {
  const user = await getServerUser();
  if (user?.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { success: false, error: 'No batch assigned' };

  try {
    // Ensure the target user actually belongs to this manager's batch
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.batchId !== dbUser.batchId) {
      return { success: false, error: 'User not found in your batch' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isPlayer }
    });
    
    revalidatePath('/dashboard/manage-batch');
    revalidatePath('/dashboard/team-management');
    return { success: true };
  } catch (error: any) {
    console.error('[toggleTeamMember]', error);
    return { success: false, error: 'Failed to update team member status' };
  }
}

export async function updateMemberRole(userId: string, teamRole: string | null) {
  const user = await getServerUser();
  if (user?.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { success: false, error: 'No batch assigned' };

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.batchId !== dbUser.batchId) {
      return { success: false, error: 'User not found in your batch' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { teamRole: teamRole?.trim() || null }
    });
    
    revalidatePath('/dashboard/manage-batch');
    revalidatePath('/dashboard/team-management');
    return { success: true };
  } catch (error: any) {
    console.error('[updateMemberRole]', error);
    return { success: false, error: 'Failed to update team role' };
  }
}
