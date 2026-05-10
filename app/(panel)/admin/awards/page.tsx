import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AwardsClient from "./AwardsClient";

export const metadata = { title: "Awards & Teams - Admin" };

export default async function AdminAwardsPage() {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const [users, tournaments] = await Promise.all([
    prisma.user.findMany({ 
      where: { status: "APPROVED" },
      select: { id: true, name: true, image: true, teamRole: true, batch: { select: { name: true } } },
      orderBy: { name: "asc" } 
    }),
    prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, isActive: true }
    })
  ]);

  return <AwardsClient users={users} tournaments={tournaments} currentUser={user} />;
}
