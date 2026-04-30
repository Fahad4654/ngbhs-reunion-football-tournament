import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: {
        batch: { select: { name: true, logoUrl: true } },
      },
      orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
    });

    return NextResponse.json(teams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}
