"use server";

import prisma from "@/lib/prisma";

/**
 * Checks if a tournament stage is completely finished.
 * If yes, it spawns matches for the next stage defined in the bracket config.
 */
export async function resolveStageIfComplete(tournamentId: string, stage: string) {
  console.log(`[BRACKET ENGINE] Checking resolution for tournament ${tournamentId}, stage ${stage}`);
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: true,
        groups: true,
        teams: {
          include: { batch: true },
        }
      }
    });

    if (!tournament || !tournament.bracketConfig) {
      console.log("[BRACKET ENGINE] No tournament or bracket config found");
      return;
    }

    // Manual sort because Prisma orderBy on joined fields can be tricky
    const sortedTeams = [...tournament.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    });

    // 1. Check if all matches in the current stage are FINISHED
    const stageMatches = tournament.matches.filter(m => m.stage === stage);
    console.log(`[BRACKET ENGINE] Found ${stageMatches.length} matches in stage ${stage}`);
    
    if (stageMatches.length === 0 && stage !== "GROUP_STAGE") return;
    
    const allFinished = stageMatches.every(m => m.status === "FINISHED");
    console.log(`[BRACKET ENGINE] All matches finished? ${allFinished}`);
    
    if (!allFinished && stage !== "MANUAL") return; 

    // 2. Find what the next stage is from bracketConfig
    const bracketStages = tournament.bracketConfig as any[];
    console.log(`[BRACKET ENGINE] Bracket Stages Config:`, bracketStages.map(s => s.stage));

    let nextConfigStage: any = null;
    if (stage === "GROUP_STAGE" || stage === "MANUAL") {
      nextConfigStage = bracketStages.length > 0 ? bracketStages[0] : null;
    } else {
      const currentStageIndex = bracketStages.findIndex(s => s.stage === stage);
      if (currentStageIndex !== -1 && currentStageIndex + 1 < bracketStages.length) {
        nextConfigStage = bracketStages[currentStageIndex + 1];
      }
    }

    if (!nextConfigStage) {
      console.log("[BRACKET ENGINE] No next stage found in config");
      return;
    }

    console.log(`[BRACKET ENGINE] Resolving for next stage: ${nextConfigStage.stage}`);

    // 3. Create the matches for the next stage
    const nextStageName = nextConfigStage.stage;

    // Helper to resolve a team ID from a placeholder string
    const resolveTeam = (placeholder: string) => {
      console.log(`[BRACKET ENGINE] Resolving team for: ${placeholder}`);
      if (!placeholder) return null;
      
      if (placeholder.startsWith("GROUP_")) {
        const parts = placeholder.split("_");
        const groupId = parts[1];
        const rankIndex = parseInt(parts[2], 10) - 1;
        
        const teamsInGroup = sortedTeams.filter(t => t.groupId === groupId);
        console.log(`[BRACKET ENGINE] Found ${teamsInGroup.length} teams in group ${groupId}`);
        
        if (teamsInGroup[rankIndex]) {
          console.log(`[BRACKET ENGINE] Resolved to team ${teamsInGroup[rankIndex].batchId}`);
          return teamsInGroup[rankIndex].batchId;
        }
      } else if (placeholder.startsWith("WINNER_")) {
        const matchConfigId = placeholder.split("_")[1];
        return deduceWinner(matchConfigId, bracketStages, tournament.matches, sortedTeams);
      } else if (placeholder.startsWith("LOSER_")) {
        const matchConfigId = placeholder.split("_")[1];
        return deduceLoser(matchConfigId, bracketStages, tournament.matches, sortedTeams);
      }
      return null;
    };

    for (const matchConfig of nextConfigStage.matches) {
      const homeTeamId = resolveTeam(matchConfig.home);
      const awayTeamId = resolveTeam(matchConfig.away);

      if (homeTeamId && awayTeamId && homeTeamId !== awayTeamId) {
        // Check if this specific match already exists
        const exists = tournament.matches.some(m => 
          m.stage === nextStageName && 
          ((m.homeTeamId === homeTeamId && m.awayTeamId === awayTeamId) || 
           (m.homeTeamId === awayTeamId && m.awayTeamId === homeTeamId))
        );

        if (!exists) {
          console.log(`[BRACKET ENGINE] Creating match: ${homeTeamId} vs ${awayTeamId}`);
          await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              stage: nextStageName,
              status: "SCHEDULED",
              homeTeamId,
              awayTeamId,
              date: new Date(),
              isFeatured: false,
            }
          });
        }
      } else {
        console.log(`[BRACKET ENGINE] Could not resolve both teams for match ${matchConfig.id}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[BRACKET ENGINE] Failed to resolve stage:", error);
    return { success: false, error: "Internal engine error" };
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
