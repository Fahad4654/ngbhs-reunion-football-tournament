'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { MatchPlayerStatus } from '@prisma/client';

export async function getUpcomingMatchesForBatch(batchId: string) {
  try {
    return await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: batchId },
          { awayTeamId: batchId }
        ],
        date: { gte: new Date() }
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
        tournament: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    });
  } catch (error) {
    console.error('[getUpcomingMatchesForBatch]', error);
    return [];
  }
}

export async function getMatchSquad(matchId: string, batchId: string) {
  try {
    return await prisma.matchSquadMember.findMany({
      where: { matchId, batchId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            teamRole: true,
            teamDesignation: true
          }
        }
      }
    });
  } catch (error) {
    console.error('[getMatchSquad]', error);
    return [];
  }
}

export async function updateMatchSquad(
  matchId: string, 
  batchId: string, 
  players: { userId: string, status: MatchPlayerStatus }[]
) {
  const user = await getServerUser();
  if (!user || (user.role !== 'BATCH_MANAGER' && user.role !== 'ADMIN' && user.role !== 'CO_ADMIN')) {
    return { success: false, error: 'Unauthorized' };
  }

  // If Batch Manager, ensure they manage their own batch
  if (user.role === 'BATCH_MANAGER') {
    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (dbUser?.batchId !== batchId) {
      return { success: false, error: 'Unauthorized: Not your batch' };
    }
  }

  try {
    // Delete existing squad for this team in this match
    await prisma.matchSquadMember.deleteMany({
      where: { matchId, batchId }
    });

    // Create new squad members
    if (players.length > 0) {
      await prisma.matchSquadMember.createMany({
        data: players.map(p => ({
          matchId,
          batchId,
          userId: p.userId,
          status: p.status
        }))
      });
    }

    revalidatePath('/dashboard/announcements');
    return { success: true };
  } catch (error: any) {
    console.error('[updateMatchSquad]', error);
    return { success: false, error: error.message || 'Failed to update squad' };
  }
}
