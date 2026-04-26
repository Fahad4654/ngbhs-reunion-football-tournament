import prisma from '@/lib/prisma';

/**
 * Fetches a single user by their ID, including their batch.
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { batch: true },
  });
}

/**
 * Fetches a single user by their email address.
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Fetches all users in a given batch with a specific status.
 */
export async function getUsersByBatch(batchId: string, status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  return prisma.user.findMany({
    where: {
      batchId,
      ...(status ? { status } : {}),
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all users for the admin panel.
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    include: { batch: true },
    orderBy: { createdAt: 'desc' },
  });
}
