import prisma from "./lib/prisma";

async function test() {
  const t = await prisma.tournament.findFirst();
  if (!t) return console.log("No tournament");
  console.log("Tournament", t.id);

  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId: t.id, status: 'FINISHED' },
    include: { homeTeam: true, awayTeam: true }
  });
  console.log("Finished matches", finishedMatches.length);
  for (const m of finishedMatches) {
    console.log(`Match: ${m.homeTeam.name} ${m.homeScore} - ${m.awayScore} ${m.awayTeam.name}`);
  }

  const teams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: t.id },
    include: { batch: true }
  });

  for (const team of teams) {
      let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;

      for (const match of finishedMatches) {
        if (match.homeTeamId === team.batchId) {
          played++;
          goalsFor += match.homeScore;
          goalsAgainst += match.awayScore;
          if (match.homeScore > match.awayScore) won++;
          else if (match.homeScore === match.awayScore) drawn++;
          else lost++;
        } else if (match.awayTeamId === team.batchId) {
          played++;
          goalsFor += match.awayScore;
          goalsAgainst += match.homeScore;
          if (match.awayScore > match.homeScore) won++;
          else if (match.awayScore === match.homeScore) drawn++;
          else lost++;
        }
      }

      const points = (won * 3) + (drawn * 1) + (lost * 0);
      console.log(`Team: ${team.batch.name} - P: ${played}, W: ${won}, D: ${drawn}, L: ${lost}, GF: ${goalsFor}, GA: ${goalsAgainst}, Pts: ${points}`);
  }
}
test();
