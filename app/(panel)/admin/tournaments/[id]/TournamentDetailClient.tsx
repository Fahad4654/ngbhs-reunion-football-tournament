"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  addTeamToTournament,
  removeTeamFromTournament,
  updateTournamentTeamStats,
} from "@/lib/actions/tournament.actions";

type Batch = { id: string; name: string };
type TournamentTeam = {
  id: string;
  batchId: string;
  batch: Batch;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};
type Tournament = {
  id: string;
  name: string;
  isActive: boolean;
  teams: TournamentTeam[];
};

export default function TournamentDetailClient({
  tournament,
  allBatches,
}: {
  tournament: Tournament;
  allBatches: Batch[];
}) {
  const [teams, setTeams] = useState(tournament.teams);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editStats, setEditStats] = useState<Partial<TournamentTeam>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const enrolledBatchIds = new Set(teams.map((t) => t.batchId));
  const availableBatches = allBatches.filter((b) => !enrolledBatchIds.has(b.id));

  function handleAddTeam() {
    if (!selectedBatchId) return;
    setError("");
    startTransition(async () => {
      const res = await addTeamToTournament(tournament.id, selectedBatchId);
      if (res.success) {
        setSelectedBatchId("");
        window.location.reload();
      } else {
        setError(res.error || "Failed to add team");
      }
    });
  }

  function handleRemoveTeam(tournamentTeamId: string) {
    if (!confirm("Remove this team from the tournament?")) return;
    startTransition(async () => {
      const res = await removeTeamFromTournament(tournamentTeamId);
      if (res.success) {
        setTeams((prev) => prev.filter((t) => t.id !== tournamentTeamId));
      }
    });
  }

  function startEdit(team: TournamentTeam) {
    setEditingTeamId(team.id);
    setEditStats({
      points: team.points,
      played: team.played,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
    });
  }

  function handleSaveStats(teamId: string) {
    startTransition(async () => {
      const res = await updateTournamentTeamStats(teamId, {
        points: Number(editStats.points ?? 0),
        played: Number(editStats.played ?? 0),
        won: Number(editStats.won ?? 0),
        drawn: Number(editStats.drawn ?? 0),
        lost: Number(editStats.lost ?? 0),
        goalsFor: Number(editStats.goalsFor ?? 0),
        goalsAgainst: Number(editStats.goalsAgainst ?? 0),
      });
      if (res.success && res.data) {
        setTeams((prev) =>
          prev
            .map((t) => (t.id === teamId ? { ...t, ...res.data } : t))
            .sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor)
        );
        setEditingTeamId(null);
      }
    });
  }

  type NumericStatKey = "played" | "won" | "drawn" | "lost" | "goalsFor" | "goalsAgainst" | "points";
  const statFields: { key: NumericStatKey; label: string }[] = [
    { key: "played", label: "P" },
    { key: "won", label: "W" },
    { key: "drawn", label: "D" },
    { key: "lost", label: "L" },
    { key: "goalsFor", label: "GF" },
    { key: "goalsAgainst", label: "GA" },
    { key: "points", label: "PTS" },
  ];

  return (
    <>
      {/* Back link + Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/admin/tournaments"
          style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          ← Back to Tournaments
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.75rem" }}>
          <h1 style={{ fontWeight: "900", fontSize: "1.8rem", margin: 0 }}>{tournament.name}</h1>
          {tournament.isActive ? (
            <span className="badge badge-live">ACTIVE</span>
          ) : (
            <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
              INACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Add Team */}
      <div className="glass" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
        <h3 style={{ fontWeight: "800", fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          Add Team to Tournament
        </h3>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select
            id="add-team-select"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            style={{
              flex: 1,
              padding: "0.65rem 1rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: selectedBatchId ? "white" : "var(--text-muted)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          >
            <option value="">— Select a batch —</option>
            {availableBatches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleAddTeam}
            disabled={!selectedBatchId || isPending}
            style={{ whiteSpace: "nowrap" }}
          >
            {isPending ? "Adding..." : "+ Add Team"}
          </button>
        </div>
        {availableBatches.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            All registered batches are already in this tournament.
          </p>
        )}
        {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
      </div>

      {/* Teams Points Table */}
      <div className="glass responsive-table-container" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem 1.25rem" }}>Team</th>
              {statFields.map((f) => (
                <th key={f.key} style={{ padding: "1rem 0.5rem", textAlign: "center", fontWeight: "700", color: f.key === "points" ? "var(--accent-primary)" : "inherit" }}>
                  {f.label}
                </th>
              ))}
              <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No teams yet. Add a batch above.
                </td>
              </tr>
            ) : (
              teams.map((team, index) => {
                const isEditing = editingTeamId === team.id;
                const gd = team.goalsFor - team.goalsAgainst;
                return (
                  <tr key={team.id} style={{ borderBottom: index === teams.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem 1.25rem", fontWeight: "700" }}>{team.batch.name}</td>
                    {statFields.map((f) => (
                      <td key={f.key} style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editStats[f.key] as number ?? 0}
                            onChange={(e) => setEditStats((prev) => ({ ...prev, [f.key]: e.target.value }))}
                            style={{
                              width: "52px",
                              padding: "0.3rem 0.4rem",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--accent-primary)",
                              borderRadius: "6px",
                              color: "white",
                              textAlign: "center",
                              fontSize: "0.85rem",
                            }}
                          />
                        ) : (
                          <span style={{
                            fontWeight: f.key === "points" ? "900" : "600",
                            color: f.key === "points" ? "var(--accent-primary)" :
                              f.key === "goalsAgainst" ? "var(--text-muted)" : "inherit",
                            fontSize: f.key === "points" ? "1.1rem" : "inherit",
                          }}>
                            {team[f.key]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        {isEditing ? (
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleSaveStats(team.id)}
                              disabled={isPending}
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                            >
                              Save
                            </button>
                            <button
                              className="btn glass"
                              onClick={() => setEditingTeamId(null)}
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn glass"
                              onClick={() => startEdit(team)}
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                            >
                              Edit Stats
                            </button>
                            <button
                              className="btn glass"
                              onClick={() => handleRemoveTeam(team.id)}
                              disabled={isPending}
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--accent-danger)" }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        * GD (Goal Difference) is computed automatically on the Standings page.
      </p>
    </>
  );
}
