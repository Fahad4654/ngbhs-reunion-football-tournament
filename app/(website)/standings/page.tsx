import prisma from "@/lib/prisma";
import styles from "./standings.module.css";
import StandingsClient from "./StandingsClient";
import { getTopScorers, getBestGoalkeepers, getBestPlayers, getSeasonAward } from "@/lib/actions/stats.actions";

export const revalidate = 60;

export async function generateMetadata() {
  return { title: "Standings – NGBHS Reunion Football Championship" };
}

async function getStandingsData(tournamentId?: string) {
  if (!tournamentId) return { activeTournamentData: null, teamsData: [] };

  const activeTournamentData = await prisma.tournament.findUnique({
    where: { id: tournamentId },
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

  const teamsData = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
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

  return { activeTournamentData, teamsData };
}

export default async function StandingsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, isActive: true },
  });

  const activeTournamentRef = tournaments.find((t: any) => t.isActive) ?? tournaments[0] ?? null;

  const [
    { activeTournamentData, teamsData },
    topScorers,
    bestGKs,
    bestPlayers,
    topTeam,
    bestEleven,
    topScorer,
    bestGK,
    bestPlayer
  ] = await Promise.all([
    getStandingsData(activeTournamentRef?.id),
    getTopScorers(activeTournamentRef?.id),
    getBestGoalkeepers(activeTournamentRef?.id),
    getBestPlayers(activeTournamentRef?.id),
    getSeasonAward("TOP_TEAM", activeTournamentRef?.id),
    getSeasonAward("BEST_ELEVEN", activeTournamentRef?.id),
    getSeasonAward("TOP_SCORER", activeTournamentRef?.id),
    getSeasonAward("BEST_GOALKEEPER", activeTournamentRef?.id),
    getSeasonAward("BEST_PLAYER", activeTournamentRef?.id),
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
        topScorer={topScorer}
        bestGK={bestGK}
        bestPlayer={bestPlayer}
      />
    </div>
  );
}
