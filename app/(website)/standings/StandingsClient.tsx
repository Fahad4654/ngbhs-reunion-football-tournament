"use client";

import { useState, useTransition } from "react";
import styles from "./standings.module.css";

type Tournament = { id: string; name: string; isActive: boolean };
type TournamentTeam = {
  id: string;
  batchId: string;
  batch: { name: string; logoUrl: string | null };
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

async function fetchTeams(tournamentId: string): Promise<TournamentTeam[]> {
  const res = await fetch(`/api/tournaments/${tournamentId}/standings`);
  if (!res.ok) return [];
  return res.json();
}

export default function StandingsClient({
  tournaments,
  initialTournamentId,
  initialTeams,
}: {
  tournaments: Tournament[];
  initialTournamentId: string | null;
  initialTeams: TournamentTeam[];
}) {
  const [selectedId, setSelectedId] = useState(initialTournamentId ?? "");
  const [teams, setTeams] = useState(initialTeams);
  const [isPending, startTransition] = useTransition();

  function handleTournamentChange(id: string) {
    setSelectedId(id);
    if (!id) { setTeams([]); return; }
    startTransition(async () => {
      const data = await fetchTeams(id);
      setTeams(data);
    });
  }

  const selectedTournament = tournaments.find((t) => t.id === selectedId);

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
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
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
              style={{
                padding: "0.6rem 1.2rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "white",
                fontSize: "0.95rem",
                fontWeight: "700",
                outline: "none",
                cursor: "pointer",
                minWidth: "240px",
              }}
            >
              <option value="">— Select a tournament —</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.isActive ? " 🟢" : ""}
                </option>
              ))}
            </select>
            {selectedTournament?.isActive && (
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
      </div>

      {/* Standings Table */}
      {selectedId && (
        <>
          {teams.length === 0 && !isPending ? (
            <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "12px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                No teams have been added to this tournament yet.
              </p>
            </div>
          ) : (
            <div className={styles.tableContainer} style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.2s" }}>
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
                  {teams.map((team, index) => {
                    const gd = team.goalsFor - team.goalsAgainst;
                    return (
                      <tr key={team.id} className={styles.row}>
                        <td>{index + 1}</td>
                        <td>
                          <div className={styles.teamCell}>
                            <div className={styles.teamLogo} />
                            <span style={{ fontWeight: "700" }}>{team.batch.name}</span>
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
        </>
      )}

      {!selectedId && tournaments.length > 0 && (
        <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "12px" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Select a tournament above to view standings.</p>
        </div>
      )}
    </section>
  );
}
