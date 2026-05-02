"use server";

import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

function isAdmin(role: string | undefined) {
  return role === "ADMIN" || role === "CO_ADMIN";
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
