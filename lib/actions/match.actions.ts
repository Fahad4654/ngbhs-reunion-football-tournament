"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { resolveStageIfComplete } from "./bracket.actions";

function isAdmin(role: string | undefined) {
  return role === "ADMIN" || role === "CO_ADMIN";
}

function isScorer(role: string | undefined) {
  return role === "ADMIN" || role === "CO_ADMIN" || role === "SCORER";
}

export async function createMatch(data: {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue?: string;
  tournamentId?: string;
  status: string;
  homeScore: number;
  awayScore: number;
  isFeatured: boolean;
  stage?: string;
}) {
  const user = await getServerUser();
  if (!isAdmin(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const match = await prisma.match.create({
      data: {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        date: new Date(data.date),
        venue: data.venue || null,
        tournamentId: data.tournamentId || null,
        status: data.status as any,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        isFeatured: data.isFeatured,
        stage: data.stage as any,
      },
      include: { homeTeam: true, awayTeam: true, tournament: true },
    });

    if (match.tournamentId) {
      await recalculateTournamentStandings(match.tournamentId);
      revalidatePath("/standings");
    }

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath("/");
    return { success: true, data: match };
  } catch (error: any) {
    console.error("[createMatch]", error);
    return { success: false, error: error.message };
  }
}

export async function updateMatch(
  id: string,
  data: {
    homeTeamId: string;
    awayTeamId: string;
    date: string;
    venue?: string;
    tournamentId?: string;
    status: string;
    homeScore: number;
    awayScore: number;
    isFeatured: boolean;
    stage?: string;
  }
) {
  const user = await getServerUser();
  if (!isAdmin(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const match = await prisma.match.update({
      where: { id },
      data: {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        date: new Date(data.date),
        venue: data.venue || null,
        tournamentId: data.tournamentId || null,
        status: data.status as any,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        isFeatured: data.isFeatured,
        stage: data.stage as any,
      },
      include: { homeTeam: true, awayTeam: true, tournament: true },
    });

    if (match.tournamentId) {
      await recalculateTournamentStandings(match.tournamentId);
      revalidatePath("/standings");

      if (match.status === "FINISHED" && match.stage) {
        await resolveStageIfComplete(match.tournamentId, match.stage);
      }
    }

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath("/");
    return { success: true, data: match };
  } catch (error: any) {
    console.error("[updateMatch]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMatch(id: string) {
  const user = await getServerUser();
  if (!isAdmin(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const match = await prisma.match.findUnique({ where: { id }, select: { tournamentId: true } });
    await prisma.match.delete({ where: { id } });
    
    if (match?.tournamentId) {
      await recalculateTournamentStandings(match.tournamentId);
      revalidatePath("/standings");
    }

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteMatch]", error);
    return { success: false, error: error.message };
  }
}

export async function updateMatchScore(
  id: string,
  data: {
    status: string;
    homeScore: number;
    awayScore: number;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
    penaltySequence?: any;
    matchPeriod?: string;
    manOfTheMatchId?: string;
    homeCleanSheet?: boolean;
    awayCleanSheet?: boolean;
  }
) {
  const user = await getServerUser();
  if (!isScorer(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const match = await prisma.match.update({
      where: { id },
      data: {
        status: data.status as any,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        homePenaltyScore: data.homePenaltyScore ?? 0,
        awayPenaltyScore: data.awayPenaltyScore ?? 0,
        penaltySequence: data.penaltySequence ?? [],
        matchPeriod: data.matchPeriod as any || 'PRE_MATCH',
        manOfTheMatchId: data.manOfTheMatchId || null,
        homeCleanSheet: data.homeCleanSheet ?? false,
        awayCleanSheet: data.awayCleanSheet ?? false,
      },
      include: { homeTeam: true, awayTeam: true, tournament: true },
    });

    revalidatePath("/dashboard/update-score");
    revalidatePath("/admin/matches");
    revalidatePath("/dashboard/scores");
    revalidatePath("/matches");
    revalidatePath("/");

    // Recalculate standings if the match is associated with a tournament
    // This runs for ANY update, ensuring if a match goes from FINISHED -> LIVE or vice versa, standings update.
    if (match.tournamentId) {
      await recalculateTournamentStandings(match.tournamentId);
      revalidatePath("/standings");

      if (match.status === "FINISHED" && match.stage) {
        await resolveStageIfComplete(match.tournamentId, match.stage);
      }
    }

    return { success: true, data: match };
  } catch (error: any) {
    console.error("[updateMatchScore]", error);
    return { success: false, error: error.message };
  }
}

export async function logMatchEvent(
  matchId: string,
  data: {
    type: any;
    minute: number;
    extraTime?: number;
    playerId?: string;
    playerInId?: string;
    assistId?: string;
    teamId?: string;
    note?: string;
  }
) {
  const user = await getServerUser();
  if (!isScorer(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        type: data.type,
        minute: data.minute,
        extraTime: data.extraTime || null,
        playerId: data.playerId || null,
        playerInId: data.playerInId || null,
        assistId: data.assistId || null,
        teamId: data.teamId || null,
        note: data.note || null,
      }
    });

    // If it's a goal, auto-update the score
    if (data.type === 'GOAL' && data.teamId) {
      const match = await prisma.match.findUnique({ where: { id: matchId } });
      if (match) {
        const isHome = match.homeTeamId === data.teamId;
        await prisma.match.update({
          where: { id: matchId },
          data: {
            homeScore: isHome ? match.homeScore + 1 : match.homeScore,
            awayScore: !isHome ? match.awayScore + 1 : match.awayScore,
          }
        });

        if (match.tournamentId && match.status === 'FINISHED') {
          await recalculateTournamentStandings(match.tournamentId);
          revalidatePath("/standings");
        }
      }
    }

    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/dashboard/update-score");
    revalidatePath("/dashboard/scores");
    revalidatePath("/");
    return { success: true, data: event };
  } catch (error: any) {
    console.error("[logMatchEvent]", error);
    return { success: false, error: error.message };
  }
}

export async function updateMatchClock(
  matchId: string,
  data: {
    running: boolean;
    minute: number;
    injuryTime?: number;
    matchPeriod?: string;
  }
) {
  const user = await getServerUser();
  if (!isScorer(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        clockRunning: data.running,
        currentMinute: data.minute,
        injuryTime: data.injuryTime ?? 0,
        matchPeriod: data.matchPeriod as any || 'PRE_MATCH',
        clockStartedAt: data.running ? new Date() : null,
      }
    });

    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/dashboard/update-score");
    revalidatePath("/dashboard/scores");
    return { success: true };
  } catch (error: any) {
    console.error("[updateMatchClock]", error);
    return { success: false, error: error.message };
  }
}

export async function updateMatchStats(
  matchId: string,
  data: any
) {
  const user = await getServerUser();
  if (!isScorer(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        homePossession: data.homePossession,
        awayPossession: data.awayPossession,
        homeShots: data.homeShots,
        awayShots: data.awayShots,
        homeShotsOnTarget: data.homeShotsOnTarget,
        awayShotsOnTarget: data.awayShotsOnTarget,
        homeCorners: data.homeCorners,
        awayCorners: data.awayCorners,
        homeOffsides: data.homeOffsides,
        awayOffsides: data.awayOffsides,
      }
    });

    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/dashboard/update-score");
    return { success: true };
  } catch (error: any) {
    console.error("[updateMatchStats]", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMatchEvent(eventId: string) {
  const user = await getServerUser();
  if (!isScorer(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const event = await prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found" };

    // If it was a goal, decrement the score
    if (event.type === 'GOAL' && event.teamId) {
      const match = await prisma.match.findUnique({ where: { id: event.matchId } });
      if (match) {
        const isHome = match.homeTeamId === event.teamId;
        await prisma.match.update({
          where: { id: event.matchId },
          data: {
            homeScore: isHome ? Math.max(0, match.homeScore - 1) : match.homeScore,
            awayScore: !isHome ? Math.max(0, match.awayScore - 1) : match.awayScore,
          }
        });

        if (match.tournamentId && match.status === 'FINISHED') {
          await recalculateTournamentStandings(match.tournamentId);
          revalidatePath("/standings");
        }
      }
    }

    await prisma.matchEvent.delete({ where: { id: eventId } });

    revalidatePath(`/matches/${event.matchId}`);
    revalidatePath("/dashboard/update-score");
    revalidatePath("/dashboard/scores");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteMatchEvent]", error);
    return { success: false, error: error.message };
  }
}

export async function updateMatchEvent(
  eventId: string,
  data: {
    minute?: number;
    playerId?: string;
    teamId?: string;
    note?: string;
  }
) {
  const user = await getServerUser();
  if (!isScorer(user?.role)) return { success: false, error: "Unauthorized" };

  try {
    const oldEvent = await prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!oldEvent) return { success: false, error: "Event not found" };

    const event = await prisma.matchEvent.update({
      where: { id: eventId },
      data: {
        minute: data.minute ?? oldEvent.minute,
        playerId: data.playerId ?? oldEvent.playerId,
        teamId: data.teamId ?? oldEvent.teamId,
        note: data.note ?? oldEvent.note,
      }
    });

    // If teamId changed and it's a goal, we'd need to adjust scores. 
    // But usually only player/minute changes in an edit.
    // To keep it simple, if teamId changes, we handle score logic:
    if (oldEvent.type === 'GOAL' && data.teamId && data.teamId !== oldEvent.teamId) {
       const match = await prisma.match.findUnique({ where: { id: oldEvent.matchId } });
       if (match) {
         // Deduct from old team, add to new team
         const wasHome = match.homeTeamId === oldEvent.teamId;
         await prisma.match.update({
           where: { id: oldEvent.matchId },
           data: {
             homeScore: wasHome ? Math.max(0, match.homeScore - 1) : match.homeScore + 1,
             awayScore: !wasHome ? Math.max(0, match.awayScore - 1) : match.awayScore + 1,
           }
         });

         if (match.tournamentId && match.status === 'FINISHED') {
           await recalculateTournamentStandings(match.tournamentId);
           revalidatePath("/standings");
         }
       }
    }

    revalidatePath(`/matches/${oldEvent.matchId}`);
    revalidatePath("/dashboard/update-score");
    return { success: true, data: event };
  } catch (error: any) {
    console.error("[updateMatchEvent]", error);
    return { success: false, error: error.message };
  }
}

export async function recalculateTournamentStandings(tournamentId: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { winPoints: true, drawPoints: true, lossPoints: true }
    });
    if (!tournament) return;

    const winPts = tournament.winPoints || 3;
    const drawPts = tournament.drawPoints || 1;
    const lossPts = tournament.lossPoints || 0;

    const finishedMatches = await prisma.match.findMany({
      where: { tournamentId, status: 'FINISHED' }
    });

    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId }
    });

    for (const team of teams) {
      let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;

      for (const match of finishedMatches) {
        if (match.homeTeamId === team.batchId) {
          played++;
          goalsFor += match.homeScore;
          goalsAgainst += match.awayScore;
          if (match.homeScore > match.awayScore) won++;
          else if (match.homeScore === match.awayScore) drawn++;
          else lost++;
        } else if (match.awayTeamId === team.batchId) {
          played++;
          goalsFor += match.awayScore;
          goalsAgainst += match.homeScore;
          if (match.awayScore > match.homeScore) won++;
          else if (match.awayScore === match.homeScore) drawn++;
          else lost++;
        }
      }

      const points = (won * winPts) + (drawn * drawPts) + (lost * lossPts);

      await prisma.tournamentTeam.update({
        where: { id: team.id },
        data: { played, won, drawn, lost, goalsFor, goalsAgainst, points }
      });
    }
  } catch (error) {
    console.error("[recalculateTournamentStandings]", error);
  }
}
