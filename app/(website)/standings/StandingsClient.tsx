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
  topScorers,
  bestGKs,
  bestPlayers,
  topTeam,
  bestEleven,
}: {
  tournaments: TournamentListInfo[];
  initialTournamentData: TournamentData | null;
  initialTeams: TeamStats[];
  topScorers: any[];
  bestGKs: any[];
  bestPlayers: any[];
  topTeam: any;
  bestEleven: any;
}) {
  const [selectedTournamentId, setSelectedTournamentId] = useState(initialTournamentData?.id || "");
  const [tournamentData, setTournamentData] = useState(initialTournamentData);
  const [teams, setTeams] = useState(initialTeams);
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
      <div className={`glass ${styles.tableContainer}`} style={{ opacity: isPending ? 0.7 : 1 }}>
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
              <div className={styles.staffLabel}>Coach</div>
              <div className={styles.staffValue}>{award.coach.name}</div>
            </div>
          )}
          {award.captain && (
            <div className={styles.staffItem}>
              <div className={styles.staffLabel}>Captain</div>
              <div className={styles.staffValue}>{award.captain.name}</div>
            </div>
          )}
        </div>
      )}

      <div className={styles.squadList}>
        {award.players.map((p: any) => (
          <div key={p.id} className={styles.squadPlayer}>
            <img src={p.image || "/default-avatar.png"} alt="" />
            <span>{p.name}</span>
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
