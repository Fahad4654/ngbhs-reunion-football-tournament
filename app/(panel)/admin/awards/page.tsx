import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AwardsClient from "./AwardsClient";

export const metadata = { title: "Awards & Teams - Admin" };

export default async function AdminAwardsPage() {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const [users, topTeam, bestEleven] = await Promise.all([
    prisma.user.findMany({ 
      where: { status: "APPROVED" },
      select: { id: true, name: true, image: true, teamRole: true, batch: { select: { name: true } } },
      orderBy: { name: "asc" } 
    }),
    prisma.seasonAward.findUnique({
      where: { category: "TOP_TEAM" },
      include: { players: { select: { id: true } }, coach: { select: { id: true } }, captain: { select: { id: true } } }
    }),
    prisma.seasonAward.findUnique({
      where: { category: "BEST_ELEVEN" },
      include: { players: { select: { id: true } }, coach: { select: { id: true } }, captain: { select: { id: true } } }
    })
  ]);

  return <AwardsClient 
    users={users} 
    initialTopTeam={topTeam} 
    initialBestEleven={bestEleven} 
  />;
}
