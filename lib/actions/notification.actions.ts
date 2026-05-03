"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const user = await getServerUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.uid },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { success: true, data: notifications };
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markAsRead(id: string) {
  const user = await getServerUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notification.update({
      where: { id, userId: user.uid },
      data: { read: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllAsRead() {
  const user = await getServerUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notification.updateMany({
      where: { userId: user.uid, read: false },
      data: { read: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}

export async function getUnreadCount() {
  const user = await getServerUser();
  if (!user) return 0;

  try {
    const count = await prisma.notification.count({
      where: { userId: user.uid, read: false },
    });
    return count;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }
}
