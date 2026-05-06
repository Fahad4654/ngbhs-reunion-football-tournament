"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

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
      },
      include: { homeTeam: true, awayTeam: true, tournament: true },
    });

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
      },
      include: { homeTeam: true, awayTeam: true, tournament: true },
    });

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
    await prisma.match.delete({ where: { id } });
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
      },
      include: { homeTeam: true, awayTeam: true, tournament: true },
    });

    revalidatePath("/dashboard/update-score");
    revalidatePath("/admin/matches");
    revalidatePath("/dashboard/scores");
    revalidatePath("/matches");
    revalidatePath("/");
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
