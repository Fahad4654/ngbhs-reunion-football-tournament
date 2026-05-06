import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import MatchCenterClient from "./MatchCenterClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true }
  });
  if (!match) return { title: 'Match Not Found' };
  return { title: `${match.homeTeam.name} vs ${match.awayTeam.name} - Match Center` };
}

export default async function MatchCenterPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!match) notFound();

  return <MatchCenterClient initialMatch={JSON.parse(JSON.stringify(match))} />;
}
