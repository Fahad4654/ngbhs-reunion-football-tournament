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

    if (!tournament) {
      console.log("[BRACKET ENGINE] Tournament not found");
      return { success: false, error: "Tournament not found" };
    }

    if (!tournament.bracketConfig || !Array.isArray(tournament.bracketConfig)) {
      console.log("[BRACKET ENGINE] No bracket config found");
      return { success: false, error: "Bracket configuration is empty. Please set up the bracket first." };
    }

    // Manual sort because Prisma orderBy on joined fields can be tricky
    const sortedTeams = [...tournament.teams].sort((a, b) => {
      const aPoints = a.points || 0;
      const bPoints = b.points || 0;
      if (bPoints !== aPoints) return bPoints - aPoints;
      
      const aGD = (a.goalsFor || 0) - (a.goalsAgainst || 0);
      const bGD = (b.goalsFor || 0) - (b.goalsAgainst || 0);
      if (bGD !== aGD) return bGD - aGD;
      
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    });

    // 1. Check if all matches in the current stage are FINISHED
    const stageMatches = tournament.matches.filter(m => m.stage === stage);
    console.log(`[BRACKET ENGINE] Found ${stageMatches.length} matches in stage ${stage}`);
    
    // If manual, we bypass the "all finished" check for the CURRENT stage matches,
    // but we still need to know which stage we are resolving FROM to find the NEXT stage.
    // Let's assume MANUAL trigger always resolves the FIRST stage in the config (the next step after groups).
    
    if (stage !== "MANUAL") {
      if (stageMatches.length === 0) return { success: false, error: "No matches found in this stage." };
      const allFinished = stageMatches.every(m => m.status === "FINISHED");
      if (!allFinished) {
        console.log(`[BRACKET ENGINE] Stage ${stage} is not fully finished yet.`);
        return { success: false, error: `Stage ${stage} is not fully finished yet.` };
      }
    }

    // 2. Find what stages to resolve from bracketConfig
    const bracketStages = tournament.bracketConfig as any[];
    
    let stagesToResolve: any[] = [];
    if (stage === "MANUAL") {
      stagesToResolve = bracketStages; // Try to resolve all possible matchups
    } else if (stage === "GROUP_STAGE") {
      stagesToResolve = bracketStages.length > 0 ? [bracketStages[0]] : [];
    } else {
      const currentStageIndex = bracketStages.findIndex(s => s.stage === stage);
      if (currentStageIndex !== -1 && currentStageIndex + 1 < bracketStages.length) {
        stagesToResolve = [bracketStages[currentStageIndex + 1]];
      }
    }

    if (stagesToResolve.length === 0) {
      console.log("[BRACKET ENGINE] No next stage found in config");
      return { success: false, error: "No next stage found in your bracket configuration." };
    }

    // 3. Create the matches for the next stage
    let createdCount = 0;

    // Helper to resolve a team ID from a placeholder string
    const resolveTeam = (placeholder: string) => {
      if (!placeholder) return null;
      
      if (placeholder.startsWith("GROUP_")) {
        const parts = placeholder.split("_");
        const groupId = parts[1];
        const rankIndex = parseInt(parts[2], 10) - 1;
        
        const teamsInGroup = sortedTeams.filter(t => t.groupId === groupId);
        if (teamsInGroup[rankIndex]) {
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

    for (const nextConfigStage of stagesToResolve) {
      const nextStageName = nextConfigStage.stage;
      console.log(`[BRACKET ENGINE] Resolving for stage: ${nextStageName}`);

      const expectedMatchups: {home: string, away: string}[] = [];

      for (const matchConfig of nextConfigStage.matches) {
        const homeTeamId = resolveTeam(matchConfig.home);
        const awayTeamId = resolveTeam(matchConfig.away);

        if (homeTeamId && awayTeamId && homeTeamId !== awayTeamId) {
          expectedMatchups.push({ home: homeTeamId, away: awayTeamId });

          // Check if this specific match already exists
          const exists = tournament.matches.some(m => 
            m.stage === nextStageName && 
            ((m.homeTeamId === homeTeamId && m.awayTeamId === awayTeamId) || 
             (m.homeTeamId === awayTeamId && m.awayTeamId === homeTeamId))
          );

          if (!exists) {
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
            createdCount++;
          }
        }
      }

      // Cleanup outdated scheduled matches
      // If a match is SCHEDULED in this stage, but its matchup is not in expectedMatchups, delete it.
      const scheduledInStage = tournament.matches.filter(m => m.stage === nextStageName && m.status === "SCHEDULED");
      for (const m of scheduledInStage) {
        const isValid = expectedMatchups.some(exp => 
          (exp.home === m.homeTeamId && exp.away === m.awayTeamId) ||
          (exp.home === m.awayTeamId && exp.away === m.homeTeamId)
        );
        if (!isValid) {
          await prisma.match.delete({ where: { id: m.id } });
          console.log(`[BRACKET ENGINE] Deleted outdated scheduled match ${m.id}`);
          createdCount++; // Increment just to show a message that changes happened
        }
      }
    }

    return { 
      success: true, 
      message: createdCount > 0 
        ? `Successfully generated/updated matches!` 
        : `No new matches were created (they might already exist or teams couldn't be resolved).` 
    };
  } catch (error: any) {
    console.error("[BRACKET ENGINE] Failed to resolve stage:", error);
    return { success: false, error: error.message || "Internal engine error" };
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
