"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { recalculateTournamentStandings } from "./match.actions";

export async function createTournament(name: string, isActive: boolean = false, bracketConfig?: any) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    if (isActive) {
      // If setting this to active, set all others to inactive
      await prisma.tournament.updateMany({
        data: { isActive: false },
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        isActive,
        bracketConfig: bracketConfig || null,
      },
    });
    
    revalidatePath("/admin/tournaments");
    revalidatePath("/standings");
    revalidatePath("/");
    
    return { success: true, data: tournament };
  } catch (error: any) {
    console.error("Failed to create tournament:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleTournamentActiveStatus(id: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Set all to inactive
    await prisma.tournament.updateMany({
      data: { isActive: false },
    });

    // Set the specific one to active
    const tournament = await prisma.tournament.update({
      where: { id },
      data: { isActive: true },
    });
    
    revalidatePath("/admin/tournaments");
    revalidatePath("/standings");
    revalidatePath("/");
    
    return { success: true, data: tournament };
  } catch (error: any) {
    console.error("Failed to toggle tournament status:", error);
    return { success: false, error: error.message };
  }
}

export async function addTeamToTournament(tournamentId: string, batchId: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const team = await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        batchId,
      },
      include: {
        batch: { select: { id: true, name: true, year: true } },
      },
    });
    
    revalidatePath(`/admin/tournaments/${tournamentId}`);
    revalidatePath("/standings");
    revalidatePath("/");
    
    return { success: true, data: team };
  } catch (error: any) {
    console.error("Failed to add team to tournament:", error);
    return { success: false, error: "Team may already be added" };
  }
}

export async function removeTeamFromTournament(tournamentTeamId: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const team = await prisma.tournamentTeam.delete({
      where: { id: tournamentTeamId },
    });
    
    revalidatePath(`/admin/tournaments/${team.tournamentId}`);
    revalidatePath("/standings");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove team from tournament:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTournamentTeamStats(
  tournamentTeamId: string, 
  stats: { points: number; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; }
) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const team = await prisma.tournamentTeam.update({
      where: { id: tournamentTeamId },
      data: stats,
    });
    
    revalidatePath(`/admin/tournaments/${team.tournamentId}`);
    revalidatePath("/standings");
    revalidatePath("/");
    
    return { success: true, data: team };
  } catch (error: any) {
    console.error("Failed to update team stats:", error);
    return { success: false, error: error.message };
  }
}

export async function renameTournament(id: string, name: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name is required" };

  try {
    const tournament = await prisma.tournament.update({
      where: { id },
      data: { name: trimmed },
    });

    revalidatePath("/admin/tournaments");
    revalidatePath("/standings");
    revalidatePath("/");

    return { success: true, data: tournament };
  } catch (error: any) {
    console.error("Failed to rename tournament:", error);
    if (error.code === "P2002") return { success: false, error: "A tournament with that name already exists" };
    return { success: false, error: error.message };
  }
}

export async function deleteTournament(id: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.tournament.delete({ where: { id } });

    revalidatePath("/admin/tournaments");
    revalidatePath("/standings");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete tournament:", error);
    return { success: false, error: "Failed to delete tournament" };
  }
}

export async function updateTournamentSettings(
  id: string,
  data: { description?: string; winPoints: number; drawPoints: number; lossPoints: number }
) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        description: data.description?.trim() || null,
        winPoints: data.winPoints,
        drawPoints: data.drawPoints,
        lossPoints: data.lossPoints,
      },
    });

    await recalculateTournamentStandings(id);
    revalidatePath(`/admin/tournaments/${id}`);
    revalidatePath("/standings");
    return { success: true, data: tournament };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTournamentGroup(tournamentId: string, name: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Group name is required" };
  try {
    const group = await prisma.tournamentGroup.create({
      data: { tournamentId, name: trimmed },
    });
    revalidatePath(`/admin/tournaments/${tournamentId}`);
    return { success: true, data: group };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "A group with that name already exists" };
    return { success: false, error: error.message };
  }
}

export async function deleteTournamentGroup(groupId: string, tournamentId: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  try {
    await prisma.tournamentGroup.delete({ where: { id: groupId } });
    revalidatePath(`/admin/tournaments/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignTeamToGroup(tournamentTeamId: string, groupId: string | null, tournamentId: string) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const team = await prisma.tournamentTeam.update({
      where: { id: tournamentTeamId },
      data: { groupId: groupId || null },
    });
    revalidatePath(`/admin/tournaments/${tournamentId}`);
    return { success: true, data: team };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveBracketConfig(tournamentId: string, bracketConfig: any) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { bracketConfig },
    });
    
    revalidatePath(`/admin/tournaments/${tournamentId}/bracket`);
    return { success: true, data: tournament };
  } catch (error: any) {
    console.error("Failed to save bracket config:", error);
    return { success: false, error: error.message };
  }
}
