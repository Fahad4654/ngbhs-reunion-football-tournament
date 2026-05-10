import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    take: 5,
    include: { tournament: true }
  });
  console.log("Recent matches:");
  matches.forEach(m => {
    console.log(`- Match ${m.id} in Tournament ${m.tournament?.name} (${m.tournamentId})`);
  });

  const events = await prisma.matchEvent.findMany({
    take: 5,
    include: { match: true }
  });
  console.log("\nRecent events:");
  events.forEach(e => {
    console.log(`- Event ${e.id} in Match ${e.matchId} (Tournament ${e.match?.tournamentId})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
