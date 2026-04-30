"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function createTournament(name: string, isActive: boolean = false) {
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
