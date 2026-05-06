import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MatchesClient from "./MatchesClient";

export const metadata = { title: "Matches - Admin" };

export default async function AdminMatchesPage() {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const [matches, batches, tournaments] = await Promise.all([
    prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true, tournament: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.batch.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tournament.findMany({ 
      orderBy: { createdAt: "desc" }, 
      select: { 
        id: true, 
        name: true, 
        isActive: true,
        teams: {
          select: {
            batchId: true,
            groupId: true
          }
        },
        groups: {
          select: {
            id: true,
            name: true
          }
        }
      } 
    }),
  ]);

  return <MatchesClient matches={matches} batches={batches} tournaments={tournaments} />;
}
