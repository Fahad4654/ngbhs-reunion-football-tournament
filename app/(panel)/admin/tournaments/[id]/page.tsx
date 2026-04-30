import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TournamentDetailClient from "./TournamentDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  return { title: tournament ? `${tournament.name} - Admin` : "Tournament - Admin" };
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerUser();

  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const [tournament, allBatches] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id },
      include: {
        groups: { orderBy: { name: "asc" } },
        teams: {
          include: {
            batch: true,
            group: { select: { id: true, name: true } },
          },
          orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
        },
      },
    }),
    prisma.batch.findMany({ orderBy: { year: "asc" }, select: { id: true, name: true, year: true } }),
  ]);

  if (!tournament) notFound();

  return <TournamentDetailClient tournament={tournament} allBatches={allBatches} />;
}
