'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

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
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        nickname: data.nickname?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        slogan: data.slogan?.trim() || null,
      },
    });
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
    const batch = await prisma.batch.update({
      where: { id: dbUser.batchId },
      data: {
        nickname: data.nickname?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        slogan: data.slogan?.trim() || null,
      },
    });
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
