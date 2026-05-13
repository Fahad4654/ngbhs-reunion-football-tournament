'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { AdPosition } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/lib/utils/upload';

export async function getAds() {
  try {
    return await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to get ads:', error);
    return [];
  }
}

export async function getActiveAdsByPosition(position: AdPosition) {
  try {
    return await prisma.advertisement.findMany({
      where: { 
        position,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error(`Failed to get active ads for position ${position}:`, error);
    return [];
  }
}

export async function createAd(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: AdPosition;
  isActive: boolean;
}) {
  const user = await getServerUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
    return { error: 'Unauthorized' };
  }

  try {
    const ad = await prisma.advertisement.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        position: data.position,
        isActive: data.isActive
      }
    });

    revalidatePath('/');
    revalidatePath('/admin/ads');
    return { success: true, ad };
  } catch (error: any) {
    console.error('Create Ad Error:', error);
    return { error: error.message || 'Failed to create advertisement' };
  }
}

export async function updateAd(id: string, data: {
  title?: string;
  imageUrl?: string;
  linkUrl?: string | null;
  position?: AdPosition;
  isActive?: boolean;
}) {
  const user = await getServerUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
    return { error: 'Unauthorized' };
  }

  try {
    const ad = await prisma.advertisement.update({
      where: { id },
      data
    });

    revalidatePath('/');
    revalidatePath('/admin/ads');
    return { success: true, ad };
  } catch (error: any) {
    return { error: error.message || 'Failed to update advertisement' };
  }
}

export async function deleteAd(id: string) {
  const user = await getServerUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
    return { error: 'Unauthorized' };
  }

  try {
    const ad = await prisma.advertisement.findUnique({ where: { id } });
    if (ad && ad.imageUrl) {
      await deleteFile(ad.imageUrl);
    }
    
    await prisma.advertisement.delete({
      where: { id }
    });

    revalidatePath('/');
    revalidatePath('/admin/ads');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete advertisement' };
  }
}

export async function toggleAdStatus(id: string, currentStatus: boolean) {
  const user = await getServerUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
    return { error: 'Unauthorized' };
  }

  try {
    const ad = await prisma.advertisement.update({
      where: { id },
      data: { isActive: !currentStatus }
    });

    revalidatePath('/');
    revalidatePath('/admin/ads');
    return { success: true, ad };
  } catch (error: any) {
    return { error: error.message || 'Failed to toggle status' };
  }
}
