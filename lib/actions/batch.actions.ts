'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────
// Batch Queries
// ─────────────────────────────────────────

/**
 * Returns all batches ordered by name. Safe to call from RSC via re-export.
 */
export async function getAllBatches() {
  try {
    return await prisma.batch.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('[getAllBatches]', error);
    return [];
  }
}

/**
 * Returns all email-verified members with PENDING status for the
 * calling Batch Manager's batch.
 */
export async function getPendingBatchMembers() {
  try {
    const user = await getServerUser();
    if (user?.role !== 'BATCH_MANAGER') return [];

    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (!dbUser?.batchId) return [];

    return await prisma.user.findMany({
      where: {
        batchId: dbUser.batchId,
        status: 'PENDING',
        emailVerified: { not: null },
      },
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

export async function createBatch(name: string) {
  const user = await getServerUser();
  if (user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'Name is required' };

  try {
    const batch = await prisma.batch.create({
      data: { name: trimmed, slug: generateSlug(trimmed) },
    });
    revalidatePath('/admin/batches');
    revalidatePath('/admin/tournaments');
    return { success: true, data: batch };
  } catch (error: any) {
    console.error('[createBatch]', error);
    if (error.code === 'P2002') return { success: false, error: 'A batch with that name already exists' };
    return { success: false, error: 'Failed to create batch' };
  }
}

export async function updateBatchName(id: string, name: string) {
  const user = await getServerUser();
  if (user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: 'Name is required' };

  try {
    const batch = await prisma.batch.update({
      where: { id },
      data: { name: trimmed, slug: generateSlug(trimmed) },
    });
    revalidatePath('/admin/batches');
    return { success: true, data: batch };
  } catch (error: any) {
    console.error('[updateBatchName]', error);
    if (error.code === 'P2002') return { success: false, error: 'A batch with that name already exists' };
    return { success: false, error: 'Failed to update batch' };
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
