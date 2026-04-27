'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { setSessionCookie } from '@/lib/auth-utils';
import { saveFile, deleteFile } from '@/lib/utils/upload';
import { revalidatePath } from 'next/cache';
import { adminAuth } from '@/lib/firebase-admin';

// ─────────────────────────────────────────
// Profile
// ─────────────────────────────────────────

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user) return { error: 'Not authenticated.' };

    const name = formData.get('name') as string;
    const occupation = formData.get('occupation') as string;
    const workplace = formData.get('workplace') as string;
    const phone = formData.get('phone') as string;
    const batchId = formData.get('batchId') as string;
    const currentAddress = formData.get('currentAddress') as string;
    const permanentAddress = formData.get('permanentAddress') as string;
    const profilePicture = formData.get('profilePicture') as File | null;

    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    let finalImageUrl = dbUser?.image ?? null;

    if (profilePicture && profilePicture.size > 0) {
      if (profilePicture.size > 5 * 1024 * 1024) {
        return { error: 'Profile picture must be under 5MB.' };
      }
      // Delete old profile picture
      if (dbUser?.image) await deleteFile(dbUser.image);
      // Save new one
      finalImageUrl = await saveFile(profilePicture, 'profiles', `profile-${user.uid}-`);
    }

    const hasBatchChanged = dbUser?.batchId !== (batchId || null);
    
    // Batch Locking: Users can set their batch once. 
    // Subsequent changes are restricted to Admins/Co-Admins.
    const isBatchAlreadySet = !!dbUser?.batchId;
    const isUserNotAdmin = user.role !== 'ADMIN' && user.role !== 'CO_ADMIN';

    if (hasBatchChanged && isBatchAlreadySet && isUserNotAdmin) {
      return { error: 'Your batch is already locked. Please contact an Administrator if you need to change your graduation batch.' };
    }

    const shouldResetStatus = hasBatchChanged && user.role === 'USER';

    await prisma.user.update({
      where: { id: user.uid },
      data: {
        name,
        occupation,
        workplace,
        phone,
        batchId: batchId || null,
        image: finalImageUrl,
        currentAddress,
        permanentAddress,
        ...(shouldResetStatus ? { status: 'PENDING' } : {}),
      },
    });

    await setSessionCookie(user.uid, user.role, name);

    revalidatePath('/profile');
    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('[updateProfile]', error);
    return { error: 'Failed to update profile.' };
  }
}

// ─────────────────────────────────────────
// Role Management (Admin / Co-Admin)
// ─────────────────────────────────────────

export async function updateUserRoleAction(
  userId: string,
  newRole: 'USER' | 'CO_ADMIN' | 'BATCH_MANAGER' | 'ADMIN'
) {
  try {
    const requester = await getServerUser();
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'CO_ADMIN')) {
      return { error: 'Unauthorized. Only Admins and Co-Admins can change roles.' };
    }

    if (userId === requester.uid) return { error: 'You cannot change your own role.' };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: 'User not found.' };

    if (requester.role === 'CO_ADMIN' && target.role === 'ADMIN') {
      return { error: 'Unauthorized. Co-Admins cannot modify root Admins.' };
    }

    if (newRole === 'BATCH_MANAGER') {
      if (!target.batchId) {
        return { error: 'User must belong to a batch to become a Batch Manager.' };
      }
      const existingManager = await prisma.user.findFirst({
        where: { batchId: target.batchId, role: 'BATCH_MANAGER', id: { not: userId } },
      });
      if (existingManager) {
        return {
          error: `Batch already has a manager: ${existingManager.name || existingManager.email}. Please demote them first.`,
        };
      }
    }

    await prisma.user.update({ where: { id: userId }, data: { role: newRole } });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('[updateUserRoleAction]', error);
    return { error: error.message || 'Failed to update user role.' };
  }
}

// ─────────────────────────────────────────
// Member Approval (Batch Manager / Admin)
// ─────────────────────────────────────────

async function isAuthorizedForMember(
  managerUid: string,
  managerRole: string,
  targetBatchId: string | null
) {
  if (managerRole === 'ADMIN' || managerRole === 'CO_ADMIN') return true;
  if (managerRole === 'BATCH_MANAGER') {
    const dbManager = await prisma.user.findUnique({ where: { id: managerUid } });
    return dbManager?.batchId === targetBatchId;
  }
  return false;
}

export async function approveUserAction(userId: string) {
  try {
    const manager = await getServerUser();
    if (!manager) return { error: 'Unauthorized.' };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: 'User not found.' };

    const authorized = await isAuthorizedForMember(manager.uid, manager.role, target.batchId);
    if (!authorized) return { error: 'You can only approve members of your own batch.' };

    await prisma.user.update({ where: { id: userId }, data: { status: 'APPROVED' } });

    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error) {
    console.error('[approveUserAction]', error);
    return { error: 'Failed to approve user.' };
  }
}

export async function rejectUserAction(userId: string) {
  try {
    const manager = await getServerUser();
    if (!manager) return { error: 'Unauthorized.' };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: 'User not found.' };

    const authorized = await isAuthorizedForMember(manager.uid, manager.role, target.batchId);
    if (!authorized) return { error: 'You can only reject members of your own batch.' };

    await prisma.user.update({ where: { id: userId }, data: { status: 'REJECTED' } });

    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error) {
    console.error('[rejectUserAction]', error);
    return { error: 'Failed to reject user.' };
  }
}

// ─────────────────────────────────────────
// User Deletion (Admin / Co-Admin)
// ─────────────────────────────────────────

export async function deleteUserAction(userId: string) {
  try {
    const requester = await getServerUser();
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'CO_ADMIN')) {
      return { error: 'Unauthorized. Only Admins and Co-Admins can delete users.' };
    }

    if (userId === requester.uid) return { error: 'You cannot delete yourself.' };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: 'User not found.' };

    if (requester.role === 'CO_ADMIN' && target.role === 'ADMIN') {
      return { error: 'Unauthorized. Co-Admins cannot delete root Admins.' };
    }

    // Cascade-delete user's posts and their media files
    const { deletePostAction } = await import('./post.actions');
    const userPosts = await prisma.post.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    await Promise.all(userPosts.map((p) => deletePostAction(p.id)));

    // 2. Delete from Firebase if a Firebase ID exists (Google OAuth users)
    if (target.firebaseId) {
      try {
        await adminAuth.deleteUser(target.firebaseId);
      } catch (fbError: any) {
        // If the user was already deleted from Firebase or not found, we continue
        if (fbError.code !== 'auth/user-not-found') {
          console.error('[deleteUserAction] Firebase Auth deletion error:', fbError);
        }
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteUserAction]', error);
    return { error: error.message || 'Failed to delete user.' };
  }
}
