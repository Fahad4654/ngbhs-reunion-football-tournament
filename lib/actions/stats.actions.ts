"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function getTopScorers(limit = 10) {
  try {
    const goals = await prisma.matchEvent.groupBy({
      by: ['playerId'],
      where: { type: 'GOAL', playerId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    if (goals.length === 0) return [];

    const playerIds = goals.map(g => g.playerId as string);
    const users = await prisma.user.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, name: true, image: true, teamRole: true, batch: { select: { name: true } } }
    });

    return goals.map(g => ({
      player: users.find(u => u.id === g.playerId)!,
      goals: g._count.id,
    })).filter(g => g.player);
  } catch (error) {
    console.error("[getTopScorers]", error);
    return [];
  }
}

export async function getBestGoalkeepers(limit = 10) {
  try {
    const gks = await prisma.user.findMany({
      where: { teamRole: { contains: "Goalkeeper", mode: "insensitive" } },
      select: { id: true, name: true, image: true, batch: { select: { name: true } } }
    });

    if (gks.length === 0) return [];

    const stats = await Promise.all(gks.map(async (gk) => {
      const matchesPlayed = await prisma.matchSquadMember.findMany({
        where: { userId: gk.id },
        include: {
          match: {
            select: { homeTeamId: true, awayTeamId: true, homeCleanSheet: true, awayCleanSheet: true, status: true }
          }
        }
      });

      let cleanSheets = 0;
      for (const m of matchesPlayed) {
        if (m.match.status !== 'FINISHED') continue;
        if (m.batchId === m.match.homeTeamId && m.match.homeCleanSheet) cleanSheets++;
        else if (m.batchId === m.match.awayTeamId && m.match.awayCleanSheet) cleanSheets++;
      }
      return { player: gk, cleanSheets };
    }));

    return stats
      .filter(s => s.cleanSheets > 0)
      .sort((a, b) => b.cleanSheets - a.cleanSheets)
      .slice(0, limit);
  } catch (error) {
    console.error("[getBestGoalkeepers]", error);
    return [];
  }
}

export async function getBestPlayers(limit = 10) {
  try {
    const goals = await prisma.matchEvent.groupBy({
      by: ['playerId'],
      where: { type: 'GOAL', playerId: { not: null } },
      _count: { id: true }
    });
    
    const assists = await prisma.matchEvent.groupBy({
      by: ['assistId'],
      where: { assistId: { not: null } },
      _count: { id: true }
    });
    
    const motms = await prisma.match.groupBy({
      by: ['manOfTheMatchId'],
      where: { manOfTheMatchId: { not: null } },
      _count: { id: true }
    });

    const playerPoints: Record<string, { goals: number, assists: number, motms: number, total: number }> = {};
    const addPoints = (id: string, type: 'goals'|'assists'|'motms', val: number) => {
      if (!playerPoints[id]) playerPoints[id] = { goals: 0, assists: 0, motms: 0, total: 0 };
      playerPoints[id][type] += val;
      if (type === 'goals') playerPoints[id].total += val * 3;
      if (type === 'assists') playerPoints[id].total += val * 2;
      if (type === 'motms') playerPoints[id].total += val * 5;
    };

    goals.forEach(g => addPoints(g.playerId!, 'goals', g._count.id));
    assists.forEach(a => addPoints(a.assistId!, 'assists', a._count.id));
    motms.forEach(m => addPoints(m.manOfTheMatchId!, 'motms', m._count.id));

    const sortedIds = Object.keys(playerPoints)
      .sort((a, b) => playerPoints[b].total - playerPoints[a].total)
      .slice(0, limit);
    
    if (sortedIds.length === 0) return [];

    const users = await prisma.user.findMany({
      where: { id: { in: sortedIds } },
      select: { id: true, name: true, image: true, teamRole: true, batch: { select: { name: true } } }
    });

    return sortedIds.map(id => ({
      player: users.find(u => u.id === id)!,
      stats: playerPoints[id]
    })).filter(p => p.player);
  } catch (error) {
    console.error("[getBestPlayers]", error);
    return [];
  }
}

export async function getSeasonAward(category: string) {
  try {
    return await prisma.seasonAward.findUnique({
      where: { category },
      include: {
        players: { select: { id: true, name: true, image: true, teamRole: true, batch: { select: { name: true } } } },
        coach: { select: { id: true, name: true, image: true, batch: { select: { name: true } } } },
        captain: { select: { id: true, name: true, image: true, batch: { select: { name: true } } } }
      }
    });
  } catch (error) {
    console.error("[getSeasonAward]", error);
    return null;
  }
}

export async function upsertSeasonAward(data: {
  category: string;
  title: string;
  description?: string;
  playerIds: string[];
  coachId?: string;
  captainId?: string;
}) {
  try {
    const user = await getServerUser();
    if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
      throw new Error("Unauthorized");
    }

    const award = await prisma.seasonAward.upsert({
      where: { category: data.category },
      update: {
        title: data.title,
        description: data.description,
        players: { set: data.playerIds.map(id => ({ id })) },
        coachId: data.coachId || null,
        captainId: data.captainId || null,
      },
      create: {
        category: data.category,
        title: data.title,
        description: data.description,
        players: { connect: data.playerIds.map(id => ({ id })) },
        coachId: data.coachId || null,
        captainId: data.captainId || null,
      }
    });

    revalidatePath("/stats");
    revalidatePath("/admin/awards");
    return { success: true, data: award };
  } catch (error: any) {
    console.error("[upsertSeasonAward]", error);
    return { success: false, error: error.message };
  }
}
