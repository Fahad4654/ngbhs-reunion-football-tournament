"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function createNews(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isExclusive?: boolean;
}) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const news = await prisma.news.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        isExclusive: data.isExclusive,
      },
    });

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
