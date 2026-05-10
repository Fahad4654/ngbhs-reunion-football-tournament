import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BracketClient from "./BracketClient";

export default async function BracketConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { groups: true }
  });

  if (!tournament) return notFound();

  return <BracketClient tournament={tournament} />;
}
