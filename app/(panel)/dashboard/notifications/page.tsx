import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.uid },
    orderBy: { createdAt: "desc" },
    take: 100, // Fetch up to 100 recent notifications
  });

  return (
    <div>
      <h1 style={{ fontWeight: '900', marginBottom: '2rem', fontSize: '2rem' }}>All Notifications</h1>
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
