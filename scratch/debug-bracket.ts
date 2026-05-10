import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function debugBracket(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: true,
      groups: { include: { teams: { include: { batch: true } } } },
      teams: { include: { batch: true } }
    }
  });

  if (!tournament) {
    console.log("Tournament not found");
    return;
  }

  console.log("Tournament Name:", tournament.name);
  console.log("Bracket Config:", JSON.stringify(tournament.bracketConfig, null, 2));
  
  const groupStageMatches = tournament.matches.filter(m => m.stage === "GROUP_STAGE");
  console.log("Group Stage Matches Count:", groupStageMatches.length);
  console.log("Finished Group Matches:", groupStageMatches.filter(m => m.status === "FINISHED").length);

  const nextStageMatches = tournament.matches.filter(m => m.stage !== "GROUP_STAGE");
  console.log("Knockout Matches in DB:", nextStageMatches.length);
  nextStageMatches.forEach(m => {
    console.log(`- ${m.stage}: ${m.homeTeamId} vs ${m.awayTeamId} (${m.status})`);
  });
}

// Get the latest tournament ID to debug
prisma.tournament.findFirst({ orderBy: { createdAt: 'desc' } }).then(t => {
  if (t) debugBracket(t.id);
});
