'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';

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
