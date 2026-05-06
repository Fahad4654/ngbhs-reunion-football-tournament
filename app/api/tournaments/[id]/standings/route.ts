import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        winPoints: true,
        drawPoints: true,
        lossPoints: true,
        groups: { select: { id: true, name: true } },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: {
        batch: { 
          select: { 
            name: true, 
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
    });

    return NextResponse.json({ tournament, teams });
  } catch {
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}
