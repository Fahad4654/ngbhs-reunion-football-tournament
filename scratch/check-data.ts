import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: {
        select: {
          matches: true,
          awards: true,
        }
      }
    }
  });

  console.log("Tournaments summary:");
  for (const t of tournaments) {
    const matchIds = (await prisma.match.findMany({ where: { tournamentId: t.id }, select: { id: true } })).map(m => m.id);
    const eventsCount = await prisma.matchEvent.count({ where: { matchId: { in: matchIds } } });
    console.log(`- ${t.name} (${t.id}): ${t._count.matches} matches, ${eventsCount} events, ${t._count.awards} awards`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
