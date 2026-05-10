import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTopScorers, getBestGoalkeepers, getBestPlayers, getSeasonAward } from "@/lib/actions/stats.actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [
      tournament,
      teams,
      topScorers,
      bestGKs,
      bestPlayers,
      topTeam,
      bestEleven,
      knockoutMatches
    ] = await Promise.all([
      prisma.tournament.findUnique({
        where: { id },
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
      }),
      prisma.tournamentTeam.findMany({
        where: { tournamentId: id },
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
      getTopScorers(id),
      getBestGoalkeepers(id),
      getBestPlayers(id),
      getSeasonAward("TOP_TEAM", id),
      getSeasonAward("BEST_ELEVEN", id),
      prisma.match.findMany({
        where: { 
          tournamentId: id,
          stage: { not: "GROUP_STAGE" }
        },
        include: {
          homeTeam: { select: { id: true, name: true, logoUrl: true } },
          awayTeam: { select: { id: true, name: true, logoUrl: true } }
        }
      })
    ]);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      tournament, 
      teams, 
      stats: { topScorers, bestGKs, bestPlayers },
      awards: { topTeam, bestEleven },
      knockoutMatches
    });
  } catch (error) {
    console.error("[TournamentAPI]", error);
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}
