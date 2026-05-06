import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true }
  });
  return {
    title: match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : "Match Details"
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
        events: {
          include: {
            player: { select: { name: true } },
            playerIn: { select: { name: true } },
            assist: { select: { name: true } },
            team: { select: { id: true, name: true } }
          },
          orderBy: { minute: 'desc' }
        },
        matchSquads: {
          include: {
            user: { select: { id: true, name: true, image: true, teamRole: true, teamDesignation: true } }
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
