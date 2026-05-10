import prisma from "@/lib/prisma";

/**
 * Checks if a tournament stage is completely finished.
 * If yes, it spawns matches for the next stage defined in the bracket config.
 */
export async function resolveStageIfComplete(tournamentId: string, stage: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: true,
        groups: true,
        teams: {
          include: { batch: true },
          orderBy: [
            { points: 'desc' },
            { goalsFor: 'desc' }
          ]
        }
      }
    });

    if (!tournament || !tournament.bracketConfig) return;

    // 1. Check if all matches in the current stage are FINISHED
    const stageMatches = tournament.matches.filter(m => m.stage === stage);
    if (stageMatches.length === 0) return; // No matches exist for this stage yet
    
    const allFinished = stageMatches.every(m => m.status === "FINISHED");
    if (!allFinished) return; // Not fully complete yet

    // 2. Find what the next stage is from bracketConfig
    const bracketStages = tournament.bracketConfig as any[];
    const currentStageIndex = bracketStages.findIndex(s => s.stage === stage);
    
    // If we are at GROUP_STAGE, the 'next stage' in the bracket config is at index 0.
    // If we are at a knockout stage, the 'next stage' is currentStageIndex + 1.
    let nextConfigStage: any = null;
    if (stage === "GROUP_STAGE") {
      nextConfigStage = bracketStages.length > 0 ? bracketStages[0] : null;
    } else if (currentStageIndex !== -1 && currentStageIndex + 1 < bracketStages.length) {
      nextConfigStage = bracketStages[currentStageIndex + 1];
    }

    if (!nextConfigStage) return; // No next stage defined

    // 3. Create the matches for the next stage
    const nextStageName = nextConfigStage.stage;

    // Check if matches for the next stage already exist to prevent duplicates
    const nextStageMatchesExist = tournament.matches.some(m => m.stage === nextStageName);
    if (nextStageMatchesExist) return;

    console.log(`[BRACKET ENGINE] Auto-generating matches for ${nextStageName}`);

    // Helper to resolve a team ID from a placeholder string like "GROUP_cuid_1" or "WINNER_M1"
    const resolveTeam = (placeholder: string) => {
      if (!placeholder) return null;
      
      if (placeholder.startsWith("GROUP_")) {
        // e.g. "GROUP_clkj123_1" (group ID is clkj123, rank is 1)
        const parts = placeholder.split("_");
        if (parts.length >= 3) {
          const groupId = parts[1];
          const rankIndex = parseInt(parts[2], 10) - 1; // 1-based to 0-based
          
          const teamsInGroup = tournament.teams.filter(t => t.groupId === groupId);
          if (teamsInGroup[rankIndex]) {
            return teamsInGroup[rankIndex].batchId;
          }
        }
      } else if (placeholder.startsWith("WINNER_")) {
        // e.g. "WINNER_M1" (Match ID from the config)
        const matchConfigId = placeholder.split("_")[1];
        // We need to find the actual match in the database.
        // Wait, the DB match doesn't know it is "M1". We need a way to link config match IDs to real matches.
        // For now, let's look at the config to see what teams played in M1, then find that real match.
        // OR better, we should save the config Match ID into the actual Match record, or deduce it.
        // Since we don't have a configMatchId in the DB yet, we have to deduce it.
        return deduceWinner(matchConfigId, bracketStages, tournament.matches, tournament.teams);
      } else if (placeholder.startsWith("LOSER_")) {
        const matchConfigId = placeholder.split("_")[1];
        return deduceLoser(matchConfigId, bracketStages, tournament.matches, tournament.teams);
      }
      return null;
    };

    for (const matchConfig of nextConfigStage.matches) {
      const homeTeamId = resolveTeam(matchConfig.home);
      const awayTeamId = resolveTeam(matchConfig.away);

      if (homeTeamId && awayTeamId && homeTeamId !== awayTeamId) {
        // Create the match
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            stage: nextStageName,
            status: "SCHEDULED",
            homeTeamId,
            awayTeamId,
            date: new Date(), // Defaults to now, admin can reschedule
            isFeatured: false,
          }
        });
      }
    }

  } catch (error) {
    console.error("[BRACKET ENGINE] Failed to resolve stage:", error);
  }
}

// Complex helper to figure out the actual winner of a configured match like "M1"
// Since our Match model doesn't store "M1", we have to reverse-engineer who played in M1.
function deduceWinner(configMatchId: string, bracketStages: any[], realMatches: any[], allTeams: any[]) {
  const realMatch = findRealMatchForConfig(configMatchId, bracketStages, realMatches, allTeams);
  if (!realMatch || realMatch.status !== "FINISHED") return null;

  if (realMatch.homeScore > realMatch.awayScore) return realMatch.homeTeamId;
  if (realMatch.awayScore > realMatch.homeScore) return realMatch.awayTeamId;
  
  // If tied, we cannot determine winner here (penalties logic needed). 
  // Returning null means the engine can't auto-assign ties without penalty data.
  return null; 
}

function deduceLoser(configMatchId: string, bracketStages: any[], realMatches: any[], allTeams: any[]) {
  const realMatch = findRealMatchForConfig(configMatchId, bracketStages, realMatches, allTeams);
  if (!realMatch || realMatch.status !== "FINISHED") return null;

  if (realMatch.homeScore < realMatch.awayScore) return realMatch.homeTeamId;
  if (realMatch.awayScore < realMatch.homeScore) return realMatch.awayTeamId;
  return null;
}

function findRealMatchForConfig(configMatchId: string, bracketStages: any[], realMatches: any[], allTeams: any[]) {
  // 1. Find the match config
  let targetMatchConfig = null;
  for (const stage of bracketStages) {
    const m = stage.matches.find((x: any) => x.id === configMatchId);
    if (m) {
      targetMatchConfig = m;
      break;
    }
  }
  if (!targetMatchConfig) return null;

  // 2. Resolve the home/away teams for that config
  // This is recursive if the config match itself relies on WINNER_x
  // To prevent infinite loops or overly complex recursion right now, 
  // we will do a basic resolution for Group stage sourced matches.
  
  let homeId = null;
  let awayId = null;
  
  // Basic group resolution
  if (targetMatchConfig.home?.startsWith("GROUP_")) {
    const parts = targetMatchConfig.home.split("_");
    const groupId = parts[1];
    const rankIndex = parseInt(parts[2], 10) - 1;
    const teamsInGroup = allTeams.filter((t: any) => t.groupId === groupId);
    if (teamsInGroup[rankIndex]) homeId = teamsInGroup[rankIndex].batchId;
  }
  if (targetMatchConfig.away?.startsWith("GROUP_")) {
    const parts = targetMatchConfig.away.split("_");
    const groupId = parts[1];
    const rankIndex = parseInt(parts[2], 10) - 1;
    const teamsInGroup = allTeams.filter((t: any) => t.groupId === groupId);
    if (teamsInGroup[rankIndex]) awayId = teamsInGroup[rankIndex].batchId;
  }

  // If we know homeId and awayId, find the real match
  if (homeId && awayId) {
    return realMatches.find((m: any) => 
      (m.homeTeamId === homeId && m.awayTeamId === awayId) ||
      (m.homeTeamId === awayId && m.awayTeamId === homeId)
    );
  }
  
  return null;
}
