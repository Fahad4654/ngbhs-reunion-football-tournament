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
      bracketConfig: true,
      groups: { select: { id: true, name: true } },
    },
  });

  const [teamsData, knockoutMatches] = await Promise.all([
    prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: {
        batch: { 
          select: { 
            name: true, 
            nickname: true,
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
    }),
    prisma.match.findMany({
      where: { 
        tournamentId,
        stage: { not: "GROUP_STAGE" }
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } }
      }
    })
  ]);

  return { activeTournamentData, teamsData, knockoutMatches };
}

export default async function StandingsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, isActive: true },
  });

  const activeTournamentRef = tournaments.find((t: any) => t.isActive) ?? tournaments[0] ?? null;

  const [
    { activeTournamentData, teamsData, knockoutMatches },
    topScorers,
    bestGKs,
    bestPlayers,
    topTeam,
    bestEleven,
  ] = await Promise.all([
    getStandingsData(activeTournamentRef?.id),
    getTopScorers(activeTournamentRef?.id),
    getBestGoalkeepers(activeTournamentRef?.id),
    getBestPlayers(activeTournamentRef?.id),
    getSeasonAward("TOP_TEAM", activeTournamentRef?.id),
    getSeasonAward("BEST_ELEVEN", activeTournamentRef?.id),
  ]);

  return (
    <div className="container">
      <StandingsClient
        tournaments={tournaments}
        initialTournamentData={activeTournamentData}
        initialTeams={teamsData}
        initialKnockoutMatches={knockoutMatches}
        topScorers={topScorers}
        bestGKs={bestGKs}
        bestPlayers={bestPlayers}
        topTeam={topTeam}
        bestEleven={bestEleven}
      />
    </div>
  );
}
