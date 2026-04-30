import prisma from "@/lib/prisma";
import styles from "./standings.module.css";
import StandingsClient from "./StandingsClient";

export const revalidate = 60;

export async function generateMetadata() {
  return { title: "Standings – NGBHS Reunion Football Championship" };
}

async function getTournamentsAndStandings() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, isActive: true },
  });

  // default to active tournament if present
  const activeTournament = tournaments.find((t: { id: string; name: string; isActive: boolean }) => t.isActive) ?? tournaments[0] ?? null;

  const teamsData = activeTournament
    ? await prisma.tournamentTeam.findMany({
        where: { tournamentId: activeTournament.id },
        include: { batch: { select: { name: true, logoUrl: true } } },
        orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
      })
    : [];

  return { tournaments, activeTournamentId: activeTournament?.id ?? null, teamsData };
}

export default async function StandingsPage() {
  const { tournaments, activeTournamentId, teamsData } = await getTournamentsAndStandings();

  return (
    <div className="container">
      <StandingsClient
        tournaments={tournaments}
        initialTournamentId={activeTournamentId}
        initialTeams={teamsData}
      />
    </div>
  );
}
