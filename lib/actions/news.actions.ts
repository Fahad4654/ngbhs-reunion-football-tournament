"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/utils/upload";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB


export async function createNews(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isExclusive?: boolean;
  batchId?: string | null;
}) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN" && user?.role !== "BATCH_MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  // If BATCH_MANAGER, they can only post news for their batch
  const finalBatchId = user.role === "BATCH_MANAGER" ? user.batchId : data.batchId;

  try {
    const news = await prisma.news.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        isExclusive: data.isExclusive,
        authorId: user.uid,
        batchId: finalBatchId,
      },
      include: {
        batch: {
          select: { name: true }
        }
      }
    });

    // Trigger notifications
    const notificationQuery: any = { status: 'APPROVED' };
    if (finalBatchId) {
      notificationQuery.batchId = finalBatchId;
    }

    const targetUsers = await prisma.user.findMany({
      where: notificationQuery,
      select: { id: true }
    });

    if (targetUsers.length > 0) {
      const notificationTitle = news.batch 
        ? `[Batch ${news.batch.name}] News: ${data.title}` 
        : `New Announcement: ${data.title}`;

      await prisma.notification.createMany({
        data: targetUsers.map(u => ({
          userId: u.id,
          title: notificationTitle,
          message: data.excerpt || 'A new announcement has been published.',
          link: `/news/${data.slug}`,
        }))
      });
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true, data: news };
  } catch (error: any) {
    console.error("Failed to create news:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return { success: false, error: "A news article with this slug already exists." };
    }
    return { success: false, error: error.message || "Failed to create news" };
  }
}

export async function updateNews(id: string, data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isExclusive?: boolean;
  batchId?: string | null;
}) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN" && user?.role !== "BATCH_MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existingNews = await prisma.news.findUnique({ where: { id } });
    
    // If BATCH_MANAGER, they can only update their own news (unless they are admin)
    if (user.role === "BATCH_MANAGER" && existingNews?.authorId !== user.uid) {
      return { success: false, error: "Unauthorized to edit this news" };
    }

    // Admins can change batch, batch managers cannot
    const finalBatchId = user.role === "BATCH_MANAGER" ? existingNews?.batchId : data.batchId;

    const oldNews = await prisma.news.findUnique({ where: { id }, select: { imageUrl: true } });

    const news = await prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        isExclusive: data.isExclusive,
        batchId: finalBatchId,
      },
    });

    // If image URL changed, delete the old one
    if (oldNews?.imageUrl && oldNews.imageUrl !== data.imageUrl) {
      await deleteFile(oldNews.imageUrl);
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath(`/news/${news.slug}`);
    return { success: true, data: news };
  } catch (error: any) {
    console.error("Failed to update news:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return { success: false, error: "A news article with this slug already exists." };
    }
    return { success: false, error: error.message || "Failed to update news" };
  }
}

export async function deleteNews(id: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN" && user?.role !== "BATCH_MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existingNews = await prisma.news.findUnique({ where: { id }, select: { imageUrl: true, authorId: true } });
    
    // If BATCH_MANAGER, they can only delete their own news
    if (user.role === "BATCH_MANAGER" && existingNews?.authorId !== user.uid) {
      return { success: false, error: "Unauthorized to delete this news" };
    }
    
    if (existingNews?.imageUrl) {
      await deleteFile(existingNews.imageUrl);
    }

    await prisma.news.delete({
      where: { id },
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete news:", error);
    return { success: false, error: "Failed to delete news" };
  }
}
