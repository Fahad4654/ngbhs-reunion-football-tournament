import prisma from "@/lib/prisma";
import styles from "./standings.module.css";
import StandingsClient from "./StandingsClient";
import { getTopScorers, getBestGoalkeepers, getBestPlayers, getSeasonAward } from "@/lib/actions/stats.actions";

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
  const activeTournamentRef = tournaments.find((t: { id: string; name: string; isActive: boolean }) => t.isActive) ?? tournaments[0] ?? null;

  let activeTournamentData = null;
  let teamsData: any[] = [];

  if (activeTournamentRef) {
    activeTournamentData = await prisma.tournament.findUnique({
      where: { id: activeTournamentRef.id },
      select: {
        id: true,
        name: true,
        description: true,
        winPoints: true,
        drawPoints: true,
        lossPoints: true,
        groups: { select: { id: true, name: true } },
      },
    });

    teamsData = await prisma.tournamentTeam.findMany({
      where: { tournamentId: activeTournamentRef.id },
      include: {
        batch: { 
          select: { 
            name: true, 
            logoUrl: true,
            members: {
              where: { isPlayer: true },
              select: { id: true, name: true, image: true, teamRole: true, teamDesignation: true }
            }
          } 
        },
        group: { select: { id: true, name: true } },
      },
      orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
    });
  }

  return { tournaments, activeTournamentData, teamsData };
}

export default async function StandingsPage() {
  const [
    { tournaments, activeTournamentData, teamsData },
    topScorers,
    bestGKs,
    bestPlayers,
    topTeam,
    bestEleven
  ] = await Promise.all([
    getTournamentsAndStandings(),
    getTopScorers(10),
    getBestGoalkeepers(10),
    getBestPlayers(10),
    getSeasonAward("TOP_TEAM"),
    getSeasonAward("BEST_ELEVEN"),
  ]);

  return (
    <div className="container">
      <StandingsClient
        tournaments={tournaments}
        initialTournamentData={activeTournamentData}
        initialTeams={teamsData}
        topScorers={topScorers}
        bestGKs={bestGKs}
        bestPlayers={bestPlayers}
        topTeam={topTeam}
        bestEleven={bestEleven}
      />
    </div>
  );
}
