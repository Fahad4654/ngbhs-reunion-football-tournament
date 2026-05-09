"use client";

import { useState, useTransition } from "react";
import styles from "./standings.module.css";
import SquadModal from "./SquadModal";

type TournamentListInfo = { id: string; name: string; isActive: boolean };

type TournamentData = {
  id: string;
  name: string;
  description: string | null;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  groups: { id: string; name: string }[];
};

type TournamentTeam = {
  id: string;
  batchId: string;
  batch: { 
    name: string; 
    logoUrl: string | null;
      members: {
        id: string;
        name: string;
        image: string | null;
        teamRole: string | null;
        teamDesignation: string | null;
      }[];
  };
  groupId: string | null;
  group: { id: string; name: string } | null;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

async function fetchTournamentData(tournamentId: string): Promise<{ tournament: TournamentData, teams: TournamentTeam[] } | null> {
  const res = await fetch(`/api/tournaments/${tournamentId}/standings`);
  if (!res.ok) return null;
  return res.json();
}

export default function StandingsClient({
  tournaments,
  initialTournamentData,
  initialTeams,
}: {
  tournaments: TournamentListInfo[];
  initialTournamentData: TournamentData | null;
  initialTeams: TournamentTeam[];
}) {
  const [selectedId, setSelectedId] = useState(initialTournamentData?.id ?? "");
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(initialTournamentData);
  const [teams, setTeams] = useState<TournamentTeam[]>(initialTeams);
  const [isPending, startTransition] = useTransition();
  const [selectedSquad, setSelectedSquad] = useState<{ name: string, players: any[] } | null>(null);

  function handleTournamentChange(id: string) {
    setSelectedId(id);
    if (!id) { 
      setTournamentData(null);
      setTeams([]); 
      return; 
    }
    startTransition(async () => {
      const data = await fetchTournamentData(id);
      if (data) {
        setTournamentData(data.tournament);
        setTeams(data.teams);
      } else {
        setTournamentData(null);
        setTeams([]);
      }
    });
  }

  const selectedTournamentInfo = tournaments.find((t) => t.id === selectedId);

  // Group teams for display
  const hasGroups = tournamentData?.groups && tournamentData.groups.length > 0;
  
  let groupedTeams: { title: string, teams: TournamentTeam[] }[] = [];
  
  if (hasGroups) {
    // Add groups
    for (const group of tournamentData!.groups) {
      groupedTeams.push({
        title: group.name,
        teams: teams.filter(t => t.groupId === group.id)
      });
    }
    // Add ungrouped teams if any exist
    const ungrouped = teams.filter(t => !t.groupId);
    if (ungrouped.length > 0) {
      groupedTeams.push({ title: "Other Teams", teams: ungrouped });
    }
  } else {
    // Just one main table
    groupedTeams = [{ title: "Overall Standings", teams: teams }];
  }

  return (
    <section className={styles.section}>
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <h1 className="text-gradient" style={{ fontSize: "3.5rem", marginBottom: "1rem", lineHeight: 1.1 }}>
          League <br />Standings
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", marginBottom: "2rem" }}>
          The race for glory. Track how each batch is performing and who is leading the charge to become the champions.
        </p>

        {/* Tournament Dropdown */}
        {tournaments.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <label
              htmlFor="tournament-select"
              style={{ fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}
            >
              Tournament
            </label>
            <select
              id="tournament-select"
              value={selectedId}
              onChange={(e) => handleTournamentChange(e.target.value)}
              style={{ minWidth: "240px", fontWeight: "700" }}
            >
              <option value="">— Select a tournament —</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.isActive ? " 🟢" : ""}
                </option>
              ))}
            </select>
            {selectedTournamentInfo?.isActive && (
              <span className="badge badge-live">ACTIVE</span>
            )}
            {isPending && (
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Loading...</span>
            )}
          </div>
        ) : (
          <div className="glass" style={{ padding: "1rem 1.5rem", borderRadius: "10px", display: "inline-block" }}>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>No tournaments have been created yet.</p>
          </div>
        )}

        {/* Tournament Info */}
        {tournamentData && (
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", opacity: isPending ? 0.5 : 1, transition: "opacity 0.2s" }}>
            {tournamentData.description && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>About</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {tournamentData.description}
                </p>
              </div>
            )}
            
            <div>
              <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Point System</h3>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Win: <strong style={{ color: "white" }}>{tournamentData.winPoints} pts</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--accent-primary)", display: "inline-block" }}></span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Draw: <strong style={{ color: "white" }}>{tournamentData.drawPoints} pts</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--accent-danger)", display: "inline-block" }}></span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loss: <strong style={{ color: "white" }}>{tournamentData.lossPoints} pts</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Standings Tables */}
      {selectedId && (
        <>
          {teams.length === 0 && !isPending ? (
            <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "12px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                No teams have been added to this tournament yet.
              </p>
            </div>
          ) : (
            <div style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.2s", display: "grid", gap: "2rem" }}>
              {groupedTeams.map((group) => (
                <div key={group.title}>
                  {hasGroups && (
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "900", marginBottom: "1rem", color: "var(--accent-primary)" }}>
                      {group.title}
                    </h2>
                  )}
                  
                  {group.teams.length === 0 ? (
                    <div className="glass" style={{ padding: "2rem", textAlign: "center", borderRadius: "12px" }}>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>No teams in this group.</p>
                    </div>
                  ) : (
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Pos</th>
                            <th>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th className={styles.points}>PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.teams.map((team, index) => {
                            const gd = team.goalsFor - team.goalsAgainst;
                            return (
                              <tr key={team.id} className={styles.row}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className={styles.teamCell}>
                                    {team.batch.logoUrl ? (
                                      <img src={team.batch.logoUrl} alt={team.batch.name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                                    ) : (
                                      <div className={styles.teamLogo} />
                                    )}
                                    <span style={{ fontWeight: "700" }}>{team.batch.name}</span>
                                    <button 
                                      className={styles.squadLink}
                                      onClick={() => setSelectedSquad({ name: team.batch.name, players: team.batch.members })}
                                    >
                                      View Squad
                                    </button>
                                  </div>
                                </td>
                                <td>{team.played}</td>
                                <td>{team.won}</td>
                                <td>{team.drawn}</td>
                                <td>{team.lost}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td className={gd >= 0 ? styles.positive : styles.negative}>
                                  {gd > 0 ? `+${gd}` : gd}
                                </td>
                                <td className={styles.points}>{team.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedId && tournaments.length > 0 && (
        <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "12px" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Select a tournament above to view standings.</p>
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
