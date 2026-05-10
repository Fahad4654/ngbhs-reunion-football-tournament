"use client";

import { useState, useTransition, useEffect } from "react";
import styles from "./standings.module.css";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import PanToolIcon from '@mui/icons-material/PanTool';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import CloseIcon from '@mui/icons-material/Close';
import CustomSelect from "@/app/components/panel/CustomSelect";

interface Player {
  id: string;
  name: string | null;
  image: string | null;
  teamRole?: string;
  batch?: { name: string };
}

interface TournamentData {
  id: string;
  name: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  bracketConfig?: any;
  groups?: { id: string; name: string }[];
}

interface TeamStats {
  id: string;
  batch: { name: string; nickname: string | null; logoUrl: string | null };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  group?: { id: string; name: string } | null;
}

interface TournamentListInfo {
  id: string;
  name: string;
  isActive: boolean;
}

export default function StandingsClient({
  tournaments,
  initialTournamentData,
  initialTeams,
  initialKnockoutMatches,
  topScorers,
  bestGKs,
  bestPlayers,
  topTeam,
  bestEleven,
}: {
  tournaments: TournamentListInfo[];
  initialTournamentData: TournamentData | null;
  initialTeams: TeamStats[];
  initialKnockoutMatches: any[];
  topScorers: any[];
  bestGKs: any[];
  bestPlayers: any[];
  topTeam: any;
  bestEleven: any;
}) {
  const [selectedTournamentId, setSelectedTournamentId] = useState(initialTournamentData?.id || "");
  const [tournamentData, setTournamentData] = useState(initialTournamentData);
  const [teams, setTeams] = useState(initialTeams);
  const [knockoutMatches, setKnockoutMatches] = useState(initialKnockoutMatches);
  const [topScorersState, setTopScorersState] = useState(topScorers);
  const [bestGKsState, setBestGKsState] = useState(bestGKs);
  const [bestPlayersState, setBestPlayersState] = useState(bestPlayers);
  const [topTeamState, setTopTeamState] = useState(topTeam);
  const [bestElevenState, setBestElevenState] = useState(bestEleven);
  const [isPending, startTransition] = useTransition();
  const [selectedSquad, setSelectedSquad] = useState<any>(null);

  const handleTournamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTournamentId(id);
    if (!id) return;

    startTransition(async () => {
      const res = await fetch(`/api/tournaments/${id}/standings`);
      const data = await res.json();
      if (data) {
        setTournamentData(data.tournament);
        setTeams(data.teams);
        setKnockoutMatches(data.knockoutMatches || []);
        setTopScorersState(data.stats.topScorers);
        setBestGKsState(data.stats.bestGKs);
        setBestPlayersState(data.stats.bestPlayers);
        setTopTeamState(data.awards.topTeam);
        setBestElevenState(data.awards.bestEleven);
      }
    });
  };

  return (
    <section className={styles.standingsSection}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tournament <span className="text-gradient">Standings</span></h1>
          <p className={styles.subtitle}>Real-time points table and player performance statistics.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.selectWrapper}>
            <CustomSelect
              value={selectedTournamentId}
              onChange={handleTournamentChange}
              label="Select Season"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isActive ? "(Active)" : ""}
                </option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Points Table */}
      <div style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
        {tournamentData?.groups && tournamentData.groups.length > 0 ? (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {tournamentData.groups.map(group => {
              const groupTeams = teams.filter(t => t.group?.id === group.id);
              if (groupTeams.length === 0) return null;
              return (
                <div key={group.id} className={`glass ${styles.tableContainer}`}>
                  <h3 style={{ padding: '1rem 1.25vw', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '1.1rem', fontWeight: 800 }}>{group.name}</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Pos</th>
                        <th style={{ textAlign: 'left' }}>Team</th>
                        <th style={{ textAlign: 'center' }}>P</th>
                        <th style={{ textAlign: 'center' }}>W</th>
                        <th style={{ textAlign: 'center' }}>D</th>
                        <th style={{ textAlign: 'center' }}>L</th>
                        <th style={{ textAlign: 'center' }}>GF</th>
                        <th style={{ textAlign: 'center' }}>GA</th>
                        <th style={{ textAlign: 'center' }}>GD</th>
                        <th style={{ textAlign: 'center' }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupTeams.map((team, index) => (
                        <tr key={team.id} className={styles.row}>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 800 }}>{index + 1}</span>
                          </td>
                          <td>
                            <div className={styles.teamCell}>
                              <img src={team.batch.logoUrl || "/default-team.png"} alt="" className={styles.teamLogo} />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{team.batch.name}</span>
                                {team.batch.nickname && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{team.batch.nickname}</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>{team.played}</td>
                          <td style={{ textAlign: 'center' }}>{team.won}</td>
                          <td style={{ textAlign: 'center' }}>{team.drawn}</td>
                          <td style={{ textAlign: 'center' }}>{team.lost}</td>
                          <td style={{ textAlign: 'center' }}>{team.goalsFor}</td>
                          <td style={{ textAlign: 'center' }}>{team.goalsAgainst}</td>
                          <td style={{ textAlign: 'center' }}>{team.goalsFor - team.goalsAgainst}</td>
                          <td className={styles.points} style={{ textAlign: 'center' }}>{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`glass ${styles.tableContainer}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Pos</th>
                  <th style={{ textAlign: 'left' }}>Team</th>
                  <th style={{ textAlign: 'center' }}>P</th>
                  <th style={{ textAlign: 'center' }}>W</th>
                  <th style={{ textAlign: 'center' }}>D</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'center' }}>GF</th>
                  <th style={{ textAlign: 'center' }}>GA</th>
                  <th style={{ textAlign: 'center' }}>GD</th>
                  <th style={{ textAlign: 'center' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={team.id} className={styles.row}>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 800 }}>{index + 1}</span>
                    </td>
                    <td>
                      <div className={styles.teamCell}>
                        <img src={team.batch.logoUrl || "/default-team.png"} alt="" className={styles.teamLogo} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{team.batch.name}</span>
                          {team.batch.nickname && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{team.batch.nickname}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{team.played}</td>
                    <td style={{ textAlign: 'center' }}>{team.won}</td>
                    <td style={{ textAlign: 'center' }}>{team.drawn}</td>
                    <td style={{ textAlign: 'center' }}>{team.lost}</td>
                    <td style={{ textAlign: 'center' }}>{team.goalsFor}</td>
                    <td style={{ textAlign: 'center' }}>{team.goalsAgainst}</td>
                    <td style={{ textAlign: 'center' }}>{team.goalsFor - team.goalsAgainst}</td>
                    <td className={styles.points} style={{ textAlign: 'center' }}>{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Knockout Bracket */}
      {tournamentData?.bracketConfig && Array.isArray(tournamentData.bracketConfig) && tournamentData.bracketConfig.length > 0 && (
        <div className={styles.bracketContainer}>
          <div className={styles.bracketTitle}>
            <h2 className="text-gradient" style={{ fontSize: '1.2rem', letterSpacing: '0.5em', opacity: 0.8 }}>ROAD TO THE FINAL</h2>
            <h2 style={{ fontSize: '3rem', fontWeight: 950, marginTop: '0.5rem' }}>KNOCKOUT <span className="text-gradient">BRACKET</span></h2>
          </div>

          <div className={styles.bracketWrapper}>
            {/* Split matches into Left and Right sides for symmetry */}
            {(() => {
              const stages = (tournamentData.bracketConfig as any[]).filter(s => s.stage !== 'THIRD_PLACE');
              const thirdPlaceStage = (tournamentData.bracketConfig as any[]).find(s => s.stage === 'THIRD_PLACE');
              const leftStages: any[] = [];
              const rightStages: any[] = [];
              let finalStage: any = null;

              stages.forEach((stage, idx) => {
                if (idx === stages.length - 1) {
                  finalStage = stage;
                } else {
                  const mid = Math.ceil(stage.matches.length / 2);
                  leftStages.push({ stage: stage.stage, matches: stage.matches.slice(0, mid) });
                  rightStages.push({ stage: stage.stage, matches: stage.matches.slice(mid) });
                }
              });

              return (
                <div className={styles.symmetricalBracket}>
                  {/* Left Side */}
                  <div className={styles.bracketSide}>
                    {leftStages.map((stage, sIdx) => (
                      <div key={stage.stage + 'left'} className={styles.bracketColumn}>
                        {stage.matches.map((matchConfig: any, mIdx: number) => {
                          const stageMatches = knockoutMatches.filter(m => m.stage === stage.stage).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                          const realMatch = stageMatches[mIdx];
                          const homeWinner = realMatch?.status === 'FINISHED' && (realMatch.homeScore > realMatch.awayScore || (realMatch.homePenaltyScore > realMatch.awayPenaltyScore));
                          const awayWinner = realMatch?.status === 'FINISHED' && (realMatch.awayScore > realMatch.homeScore || (realMatch.awayPenaltyScore > realMatch.homePenaltyScore));

                          return (
                            <div key={matchConfig.id} className={styles.uclMatchPair}>
                              <div className={`${styles.uclTeamBox} ${homeWinner ? styles.uclWinner : ''}`}>
                                <img src={realMatch?.homeTeam?.logoUrl || "/default-team.png"} className={styles.uclLogo} alt="" />
                                <span className={styles.uclTeamName}>{realMatch?.homeTeam?.name || matchConfig.home.replace(/_/g, " ").replace("GROUP_", "Group ").replace("_1", " #1").replace("_2", " #2")}</span>
                                <span className={styles.uclScore}>{realMatch?.status !== 'SCHEDULED' ? realMatch?.homeScore : ''}</span>
                              </div>
                              <div className={`${styles.uclTeamBox} ${awayWinner ? styles.uclWinner : ''}`}>
                                <img src={realMatch?.awayTeam?.logoUrl || "/default-team.png"} className={styles.uclLogo} alt="" />
                                <span className={styles.uclTeamName}>{realMatch?.awayTeam?.name || matchConfig.away.replace(/_/g, " ").replace("GROUP_", "Group ").replace("_1", " #1").replace("_2", " #2")}</span>
                                <span className={styles.uclScore}>{realMatch?.status !== 'SCHEDULED' ? realMatch?.awayScore : ''}</span>
                              </div>
                              <div className={styles.uclStageMarker}>{stage.stage.replace("ROUND_OF_16", "R16").replace("QUARTER_FINAL", "QF").replace("SEMI_FINAL", "SF")}</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Center / Final */}
                  <div className={styles.bracketCenter}>
                    <div className={styles.trophyWrapper}>
                      <EmojiEventsIcon className={styles.uclTrophyIcon} />
                      <div className={styles.trophyGlowSmall} />
                    </div>
                    
                    <div className={styles.finalLabel}>THE GRAND FINAL</div>

                    {finalStage && finalStage.matches.map((matchConfig: any) => {
                      const realMatch = knockoutMatches.find(m => m.stage === finalStage.stage);
                      const homeWinner = realMatch?.status === 'FINISHED' && (realMatch.homeScore > realMatch.awayScore || (realMatch.homePenaltyScore > realMatch.awayPenaltyScore));
                      const awayWinner = realMatch?.status === 'FINISHED' && (realMatch.awayScore > realMatch.homeScore || (realMatch.awayPenaltyScore > realMatch.homePenaltyScore));

                      return (
                        <div key={matchConfig.id} className={styles.uclFinalBox}>
                          <div className={`${styles.uclTeamBox} ${homeWinner ? styles.uclWinner : ''}`}>
                            <img src={realMatch?.homeTeam?.logoUrl || "/default-team.png"} className={styles.uclLogo} alt="" />
                            <span className={styles.uclTeamName}>{realMatch?.homeTeam?.name || matchConfig.home.replace(/_/g, " ").replace("WINNER_", "Winner ")}</span>
                            <span className={styles.uclScore}>{realMatch?.status !== 'SCHEDULED' ? realMatch?.homeScore : ''}</span>
                          </div>
                          <div className={`${styles.uclTeamBox} ${awayWinner ? styles.uclWinner : ''}`}>
                            <img src={realMatch?.awayTeam?.logoUrl || "/default-team.png"} className={styles.uclLogo} alt="" />
                            <span className={styles.uclTeamName}>{realMatch?.awayTeam?.name || matchConfig.away.replace(/_/g, " ").replace("WINNER_", "Winner ")}</span>
                            <span className={styles.uclScore}>{realMatch?.status !== 'SCHEDULED' ? realMatch?.awayScore : ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Side */}
                  <div className={styles.bracketSide}>
                    {rightStages.slice().reverse().map((stage, sIdx) => (
                      <div key={stage.stage + 'right'} className={styles.bracketColumn}>
                        {stage.matches.map((matchConfig: any, mIdx: number) => {
                          const stageMatches = knockoutMatches.filter(m => m.stage === stage.stage).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                          const originalStage = (tournamentData.bracketConfig as any[]).find(s => s.stage === stage.stage);
                          const mid = Math.ceil(originalStage.matches.length / 2);
                          const realMatch = stageMatches[mid + mIdx];
                          const homeWinner = realMatch?.status === 'FINISHED' && (realMatch.homeScore > realMatch.awayScore || (realMatch.homePenaltyScore > realMatch.awayPenaltyScore));
                          const awayWinner = realMatch?.status === 'FINISHED' && (realMatch.awayScore > realMatch.homeScore || (realMatch.awayPenaltyScore > realMatch.homePenaltyScore));

                          return (
                            <div key={matchConfig.id} className={`${styles.uclMatchPair} ${styles.uclMatchPairRight}`}>
                              <div className={`${styles.uclTeamBox} ${homeWinner ? styles.uclWinner : ''}`}>
                                <span className={styles.uclScore}>{realMatch?.status !== 'SCHEDULED' ? realMatch?.homeScore : ''}</span>
                                <span className={styles.uclTeamName}>{realMatch?.homeTeam?.name || matchConfig.home.replace(/_/g, " ").replace("GROUP_", "Group ").replace("_1", " #1").replace("_2", " #2")}</span>
                                <img src={realMatch?.homeTeam?.logoUrl || "/default-team.png"} className={styles.uclLogo} alt="" />
                              </div>
                              <div className={`${styles.uclTeamBox} ${awayWinner ? styles.uclWinner : ''}`}>
                                <span className={styles.uclScore}>{realMatch?.status !== 'SCHEDULED' ? realMatch?.awayScore : ''}</span>
                                <span className={styles.uclTeamName}>{realMatch?.awayTeam?.name || matchConfig.away.replace(/_/g, " ").replace("GROUP_", "Group ").replace("_1", " #1").replace("_2", " #2")}</span>
                                <img src={realMatch?.awayTeam?.logoUrl || "/default-team.png"} className={styles.uclLogo} alt="" />
                              </div>
                              <div className={styles.uclStageMarker}>{stage.stage.replace("ROUND_OF_16", "R16").replace("QUARTER_FINAL", "QF").replace("SEMI_FINAL", "SF")}</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── Hybrid Leaderboards ─── */}
      <div style={{ marginTop: "4rem" }}>
        <h2 className={styles.sectionTitle}>
          Tournament <span className="text-gradient">Leaderboards</span>
        </h2>
        <p className={styles.sectionSubtitle}>
          Hybrid rankings combining match statistics and judge ratings.
        </p>

        <div className={styles.statsGrid}>
          {/* Top Scorers */}
          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><SportsSoccerIcon /></div>
              <div>
                <h3 className={styles.cardTitle}>Top Scorers</h3>
                <p className={styles.cardSub}>95% Stats + 5% Judge Rating</p>
              </div>
            </div>
            <div className={styles.list}>
              {topScorersState.length > 0 ? topScorersState.map((item: any, i: number) => (
                <div key={item.player.id} className={`${styles.listItem} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ""}`}>
                  <div className={styles.rank}>
                    {i === 0 ? <MilitaryTechIcon sx={{ color: '#FFD700' }} /> : i === 1 ? <MilitaryTechIcon sx={{ color: '#C0C0C0' }} /> : i === 2 ? <MilitaryTechIcon sx={{ color: '#CD7F32' }} /> : <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                  </div>
                  <img src={item.player.image || "/default-avatar.png"} alt={item.player.name || ""} className={styles.avatar} />
                  <div className={styles.info}>
                    <div className={styles.name}>{item.player.name}</div>
                    <div className={styles.meta}>{item.player.batch?.name || "No Batch"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.statBadge}>{item.goals} <span>goals</span></div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 800 }}>{item.finalScore.toFixed(1)} PTS</div>
                  </div>
                </div>
              )) : <p className={styles.empty}>No goals recorded yet.</p>}
            </div>
          </div>

          {/* Best Goalkeepers */}
          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><PanToolIcon /></div>
              <div>
                <h3 className={styles.cardTitle}>Best Goalkeepers</h3>
                <p className={styles.cardSub}>70% Stats + 30% Judge Rating</p>
              </div>
            </div>
            <div className={styles.list}>
              {bestGKsState.length > 0 ? bestGKsState.map((item: any, i: number) => (
                <div key={item.player.id} className={`${styles.listItem} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ""}`}>
                  <div className={styles.rank}>
                    {i === 0 ? <MilitaryTechIcon sx={{ color: '#FFD700' }} /> : i === 1 ? <MilitaryTechIcon sx={{ color: '#C0C0C0' }} /> : i === 2 ? <MilitaryTechIcon sx={{ color: '#CD7F32' }} /> : <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                  </div>
                  <img src={item.player.image || "/default-avatar.png"} alt={item.player.name || ""} className={styles.avatar} />
                  <div className={styles.info}>
                    <div className={styles.name}>{item.player.name}</div>
                    <div className={styles.meta}>{item.player.batch?.name || "No Batch"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.statBadge}>{item.cleanSheets} <span>CS</span></div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 800 }}>{item.finalScore.toFixed(1)} PTS</div>
                  </div>
                </div>
              )) : <p className={styles.empty}>No clean sheets recorded yet.</p>}
            </div>
          </div>

          {/* Best Players */}
          <div className={`glass ${styles.card}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><StarIcon /></div>
              <div>
                <h3 className={styles.cardTitle}>Best Players (MVP)</h3>
                <p className={styles.cardSub}>60% Stats + 40% Judge Rating</p>
              </div>
            </div>
            <div className={styles.list}>
              {bestPlayersState.length > 0 ? bestPlayersState.map((item: any, i: number) => (
                <div key={item.player.id} className={`${styles.listItem} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ""}`}>
                  <div className={styles.rank}>
                    {i === 0 ? <MilitaryTechIcon sx={{ color: '#FFD700' }} /> : i === 1 ? <MilitaryTechIcon sx={{ color: '#C0C0C0' }} /> : i === 2 ? <MilitaryTechIcon sx={{ color: '#CD7F32' }} /> : <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                  </div>
                  <img src={item.player.image || "/default-avatar.png"} alt={item.player.name || ""} className={styles.avatar} />
                  <div className={styles.info}>
                    <div className={styles.name}>{item.player.name}</div>
                    <div className={styles.meta}>
                      {item.player.batch?.name || "No Batch"}
                      <div className={styles.statChips}>
                        <span title="Goals">{item.stats.goals}G</span>
                        <span title="Assists">{item.stats.assists}A</span>
                        <span title="MOTM">{item.stats.motms}<EmojiEventsIcon sx={{ fontSize: '0.7rem', verticalAlign: 'text-bottom' }} /></span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.statBadge}>{item.finalScore.toFixed(1)} <span>pts</span></div>
                  </div>
                </div>
              )) : <p className={styles.empty}>No stats recorded yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Curated Teams ─── */}
      {(topTeamState || bestElevenState) && (
        <div style={{ marginTop: "4rem" }}>
          <h2 className={styles.sectionTitle}>
            Teams of the <span className="text-gradient">Season</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Manually curated teams featuring the best performers.
          </p>

          <div className={styles.awardsGrid}>
            {topTeamState && topTeamState.players.length > 0 && (
              <AwardCard award={topTeamState} icon={<EmojiEventsIcon />} />
            )}
            {bestElevenState && bestElevenState.players.length > 0 && (
              <AwardCard award={bestElevenState} icon={<StarIcon />} />
            )}
          </div>
        </div>
      )}

      {selectedSquad && (
        <SquadModal 
          teamName={selectedSquad.name}
          players={selectedSquad.players}
          onClose={() => setSelectedSquad(null)}
        />
      )}
    </section>
  );
}

function AwardCard({ award, icon }: { award: any; icon: React.ReactNode }) {
  return (
    <div className={`glass ${styles.awardCard}`}>
      <div className={styles.awardHeader}>
        <span className={styles.awardIcon}>{icon}</span>
        <div>
          <h3 className={styles.awardTitle}>{award.title}</h3>
          {award.description && (
            <p className={styles.awardDesc}>{award.description}</p>
          )}
        </div>
      </div>

      {(award.coach || award.captain) && (
        <div className={styles.staffRow}>
          {award.coach && (
            <div className={styles.staffItem}>
              <img src={award.coach.image || "/default-avatar.png"} alt="" className={styles.staffAvatar} />
              <div>
                <div className={styles.staffLabel}>Coach</div>
                <div className={styles.staffName}>{award.coach.name}</div>
              </div>
            </div>
          )}
          {award.captain && (
            <div className={styles.staffItem}>
              <img src={award.captain.image || "/default-avatar.png"} alt="" className={styles.staffAvatar} />
              <div>
                <div className={styles.staffLabel}>Captain</div>
                <div className={styles.staffName}>{award.captain.name}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.squadGrid}>
        {award.players.map((p: any) => (
          <div key={p.id} className={styles.squadPlayer}>
            <img src={p.image || "/default-avatar.png"} alt="" className={styles.squadAvatar} />
            <span className={styles.squadName}>{p.name}</span>
            <span className={styles.squadBatch}>{p.batch?.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SquadModal({ teamName, players, onClose }: { teamName: string; players: any[]; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`glass ${styles.modalContent}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{teamName}</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalGrid}>
            {players.map(p => (
              <div key={p.id} className={styles.modalPlayer}>
                <img src={p.image || "/default-avatar.png"} alt="" />
                <div className={styles.modalPlayerInfo}>
                  <div className={styles.modalPlayerName}>{p.name}</div>
                  <div className={styles.modalPlayerBatch}>{p.batch?.name}</div>
                  <div className={styles.modalPlayerRole}>{p.teamRole}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
