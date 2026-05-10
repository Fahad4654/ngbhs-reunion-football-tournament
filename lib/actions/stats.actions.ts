"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function submitAwardRating(data: {
  tournamentId: string;
  category: string;
  playerId: string;
  rating: number;
  comment?: string;
}) {
  try {
    const user = await getServerUser();
    if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
      throw new Error("Unauthorized");
    }

    const awardRating = await prisma.awardRating.upsert({
      where: {
        tournamentId_category_playerId_judgeId: {
          tournamentId: data.tournamentId,
          category: data.category,
          playerId: data.playerId,
          judgeId: user.uid
        }
      },
      update: {
        rating: data.rating,
        comment: data.comment
      },
      create: {
        tournamentId: data.tournamentId,
        category: data.category,
        playerId: data.playerId,
        judgeId: user.uid,
        rating: data.rating,
        comment: data.comment
      }
    });

    revalidatePath("/admin/awards");
    return { success: true, data: awardRating };
  } catch (error: any) {
    console.error("[submitAwardRating]", error);
    return { success: false, error: error.message };
  }
}

export async function getAwardRatings(tournamentId: string, category: string) {
  try {
    const ratings = await prisma.awardRating.findMany({
      where: { tournamentId, category },
      include: {
        judge: { select: { id: true, name: true } }
      }
    });

    // Group by playerId
    const playerRatings: Record<string, { avgRating: number, count: number, ratings: any[] }> = {};
    ratings.forEach(r => {
      if (!playerRatings[r.playerId]) playerRatings[r.playerId] = { avgRating: 0, count: 0, ratings: [] };
      playerRatings[r.playerId].ratings.push(r);
      playerRatings[r.playerId].count++;
    });

    Object.keys(playerRatings).forEach(pid => {
      const sum = playerRatings[pid].ratings.reduce((s, r) => s + r.rating, 0);
      playerRatings[pid].avgRating = sum / playerRatings[pid].count;
    });

    return playerRatings;
  } catch (error) {
    console.error("[getAwardRatings]", error);
    return {};
  }
}

export async function getTopScorers(tournamentId?: string, limit = 10) {
  try {
    const goals = await prisma.matchEvent.groupBy({
      by: ['playerId'],
      where: { 
        type: 'GOAL', 
        playerId: { not: null },
        match: tournamentId ? { tournamentId } : undefined
      },
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

    // Manual ratings for Top Scorer (Weight 5%)
    const manualRatings = tournamentId ? await getAwardRatings(tournamentId, "TOP_SCORER") : {};
    
    const maxGoals = Math.max(...goals.map(g => g._count.id));

    const stats = goals.map(g => {
      const player = users.find(u => u.id === g.playerId)!;
      if (!player) return null;
      
      const autoScore = (g._count.id / maxGoals) * 100;
      const manualScore = manualRatings[player.id] ? manualRatings[player.id].avgRating * 10 : 0;
      
      const finalScore = (autoScore * 0.95) + (manualScore * 0.05);

      return {
        player,
        goals: g._count.id,
        autoScore,
        manualScore,
        finalScore,
        manualVotes: manualRatings[player.id]?.count || 0
      };
    }).filter(s => s !== null);

    return stats.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
  } catch (error) {
    console.error("[getTopScorers]", error);
    return [];
  }
}

export async function getBestGoalkeepers(tournamentId?: string, limit = 10) {
  try {
    const gks = await prisma.user.findMany({
      where: { teamRole: { contains: "Goalkeeper", mode: "insensitive" } },
      select: { id: true, name: true, image: true, batch: { select: { name: true } } }
    });

    if (gks.length === 0) return [];

    const stats = await Promise.all(gks.map(async (gk) => {
      const matchesPlayed = await prisma.matchSquadMember.findMany({
        where: { 
          userId: gk.id,
          match: tournamentId ? { tournamentId } : undefined
        },
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

    const validStats = stats.filter(s => s.cleanSheets > 0);
    if (validStats.length === 0) return [];

    const maxCS = Math.max(...validStats.map(s => s.cleanSheets));
    
    // Manual ratings for Best Goalkeeper (Weight 30%)
    const manualRatings = tournamentId ? await getAwardRatings(tournamentId, "BEST_GOALKEEPER") : {};

    const hybridStats = validStats.map(s => {
      const autoScore = (s.cleanSheets / maxCS) * 100;
      const manualScore = manualRatings[s.player.id] ? manualRatings[s.player.id].avgRating * 10 : 0;
      const finalScore = (autoScore * 0.7) + (manualScore * 0.3);

      return {
        ...s,
        autoScore,
        manualScore,
        finalScore,
        manualVotes: manualRatings[s.player.id]?.count || 0
      };
    });

    return hybridStats
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);
  } catch (error) {
    console.error("[getBestGoalkeepers]", error);
    return [];
  }
}

export async function getBestPlayers(tournamentId?: string, limit = 10) {
  try {
    const goals = await prisma.matchEvent.groupBy({
      by: ['playerId'],
      where: { 
        type: 'GOAL', 
        playerId: { not: null },
        match: tournamentId ? { tournamentId } : undefined
      },
      _count: { id: true }
    });
    
    const assists = await prisma.matchEvent.groupBy({
      by: ['assistId'],
      where: { 
        assistId: { not: null },
        match: tournamentId ? { tournamentId } : undefined
      },
      _count: { id: true }
    });
    
    const motms = await prisma.match.groupBy({
      by: ['manOfTheMatchId'],
      where: { 
        manOfTheMatchId: { not: null },
        tournamentId: tournamentId || undefined
      },
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

    const playerIds = Object.keys(playerPoints);
    if (playerIds.length === 0) return [];

    const users = await prisma.user.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, name: true, image: true, teamRole: true, batch: { select: { name: true } } }
    });

    const maxTotal = Math.max(...Object.values(playerPoints).map(p => p.total));

    // Manual ratings for Best Player (Weight 40%)
    const manualRatings = tournamentId ? await getAwardRatings(tournamentId, "BEST_PLAYER") : {};

    const hybridStats = playerIds.map(id => {
      const player = users.find(u => u.id === id)!;
      if (!player) return null;

      const autoScore = (playerPoints[id].total / maxTotal) * 100;
      const manualScore = manualRatings[id] ? manualRatings[id].avgRating * 10 : 0;
      const finalScore = (autoScore * 0.6) + (manualScore * 0.4);

      return {
        player,
        stats: playerPoints[id],
        autoScore,
        manualScore,
        finalScore,
        manualVotes: manualRatings[id]?.count || 0
      };
    }).filter(s => s !== null) as any[];

    return hybridStats.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
  } catch (error) {
    console.error("[getBestPlayers]", error);
    return [];
  }
}

export async function getSeasonAward(category: string, tournamentId?: string) {
  try {
    if (!tournamentId) {
      // If no tournamentId provided, we can't find a unique award anymore
      // We'll return null or the most recent one? 
      // User said "tournament wise", so we should ideally always have a tournamentId.
      return null;
    }
    return await prisma.seasonAward.findUnique({
      where: { 
        category_tournamentId: {
          category,
          tournamentId
        }
      },
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
  tournamentId: string;
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
      where: { 
        category_tournamentId: {
          category: data.category,
          tournamentId: data.tournamentId
        }
      },
      update: {
        title: data.title,
        description: data.description,
        players: { set: data.playerIds.map(id => ({ id })) },
        coachId: data.coachId || null,
        captainId: data.captainId || null,
      },
      create: {
        category: data.category,
        tournamentId: data.tournamentId,
        title: data.title,
        description: data.description,
        players: { connect: data.playerIds.map(id => ({ id })) },
        coachId: data.coachId || null,
        captainId: data.captainId || null,
      }
    });

    revalidatePath("/standings");
    revalidatePath("/admin/awards");
    return { success: true, data: award };
  } catch (error: any) {
    console.error("[upsertSeasonAward]", error);
    return { success: false, error: error.message };
  }
}
