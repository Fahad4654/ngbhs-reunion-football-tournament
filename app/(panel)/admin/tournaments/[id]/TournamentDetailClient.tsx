"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  addTeamToTournament,
  removeTeamFromTournament,
  updateTournamentTeamStats,
  updateTournamentSettings,
  createTournamentGroup,
  deleteTournamentGroup,
  assignTeamToGroup,
} from "@/lib/actions/tournament.actions";

// ── Types ────────────────────────────────────────────────────────────
type Batch = { id: string; name: string; year: number };
type Group = { id: string; name: string };
type TournamentTeam = {
  id: string; batchId: string; batch: Batch;
  groupId: string | null; group: Group | null;
  points: number; played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number;
};
type Tournament = {
  id: string; name: string; isActive: boolean;
  description: string | null;
  winPoints: number; drawPoints: number; lossPoints: number;
  groups: Group[];
  teams: TournamentTeam[];
};

const lbl: React.CSSProperties = {
  display: "block", fontWeight: "700", fontSize: "0.72rem",
  textTransform: "uppercase", color: "var(--text-muted)",
  letterSpacing: "0.07em", marginBottom: "0.35rem",
};
type Tab = "settings" | "groups" | "teams";

export default function TournamentDetailClient({
  tournament, allBatches,
}: {
  tournament: Tournament; allBatches: Batch[];
}) {
  const [tab, setTab] = useState<Tab>("settings");

  // Settings state
  const [desc, setDesc] = useState(tournament.description ?? "");
  const [winPts, setWinPts] = useState(tournament.winPoints);
  const [drawPts, setDrawPts] = useState(tournament.drawPoints);
  const [lossPts, setLossPts] = useState(tournament.lossPoints);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Groups state
  const [groups, setGroups] = useState<Group[]>(tournament.groups);
  const [newGroupName, setNewGroupName] = useState("");

  // Teams state
  const [teams, setTeams] = useState(tournament.teams);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editStats, setEditStats] = useState<Partial<TournamentTeam>>({});

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // ── Settings ────────────────────────────────────────────────────────
  function handleSaveSettings() {
    setError(""); setSettingsSaved(false);
    startTransition(async () => {
      const res = await updateTournamentSettings(tournament.id, {
        description: desc, winPoints: winPts, drawPoints: drawPts, lossPoints: lossPts,
      });
      if (res.success) { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }
      else setError(res.error ?? "Failed to save settings");
    });
  }

  // ── Groups ──────────────────────────────────────────────────────────
  function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await createTournamentGroup(tournament.id, newGroupName.trim());
      if (res.success && res.data) {
        setGroups((prev) => [...prev, res.data!].sort((a, b) => a.name.localeCompare(b.name)));
        setNewGroupName("");
      } else setError(res.error ?? "Failed to create group");
    });
  }

  function handleDeleteGroup(groupId: string, groupName: string) {
    if (!confirm(`Delete "${groupName}"? Teams in this group will become ungrouped.`)) return;
    startTransition(async () => {
      const res = await deleteTournamentGroup(groupId, tournament.id);
      if (res.success) {
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        setTeams((prev) => prev.map((t) => t.groupId === groupId ? { ...t, groupId: null, group: null } : t));
      }
    });
  }

  function handleAssignGroup(teamId: string, groupId: string) {
    startTransition(async () => {
      const res = await assignTeamToGroup(teamId, groupId || null, tournament.id);
      if (res.success) {
        const grp = groups.find((g) => g.id === groupId) ?? null;
        setTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, groupId: groupId || null, group: grp } : t));
      }
    });
  }

  // ── Teams ───────────────────────────────────────────────────────────
  const enrolledBatchIds = new Set(teams.map((t) => t.batchId));
  const availableBatches = allBatches.filter((b) => !enrolledBatchIds.has(b.id));

  function handleAddTeam() {
    if (!selectedBatchId) return;
    setError("");
    startTransition(async () => {
      const res = await addTeamToTournament(tournament.id, selectedBatchId);
      if (res.success && res.data) { 
        setSelectedBatchId(""); 
        setTeams((prev) => [...prev, res.data as any].sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor));
      }
      else setError(res.error ?? "Failed to add team");
    });
  }

  function handleRemoveTeam(tournamentTeamId: string) {
    if (!confirm("Remove this team from the tournament?")) return;
    startTransition(async () => {
      const res = await removeTeamFromTournament(tournamentTeamId);
      if (res.success) setTeams((prev) => prev.filter((t) => t.id !== tournamentTeamId));
    });
  }

  type NumericStatKey = "played" | "won" | "drawn" | "lost" | "goalsFor" | "goalsAgainst" | "points";
  const statFields: { key: NumericStatKey; label: string }[] = [
    { key: "played", label: "P" }, { key: "won", label: "W" }, { key: "drawn", label: "D" },
    { key: "lost", label: "L" }, { key: "goalsFor", label: "GF" }, { key: "goalsAgainst", label: "GA" },
    { key: "points", label: "PTS" },
  ];

  function startEdit(team: TournamentTeam) {
    setEditingTeamId(team.id);
    setEditStats({ points: team.points, played: team.played, won: team.won, drawn: team.drawn, lost: team.lost, goalsFor: team.goalsFor, goalsAgainst: team.goalsAgainst });
  }

  function handleSaveStats(teamId: string) {
    startTransition(async () => {
      const res = await updateTournamentTeamStats(teamId, {
        points: Number(editStats.points ?? 0), played: Number(editStats.played ?? 0),
        won: Number(editStats.won ?? 0), drawn: Number(editStats.drawn ?? 0),
        lost: Number(editStats.lost ?? 0), goalsFor: Number(editStats.goalsFor ?? 0),
        goalsAgainst: Number(editStats.goalsAgainst ?? 0),
      });
      if (res.success && res.data) {
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, ...res.data } : t))
            .sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor)
        );
        setEditingTeamId(null);
      }
    });
  }

  // ── Render ───────────────────────────────────────────────────────────
  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "800",
    fontSize: "0.82rem", cursor: "pointer", border: "none",
    background: tab === t ? "var(--accent-primary)" : "transparent",
    color: tab === t ? "black" : "var(--text-muted)",
    transition: "all 0.15s",
  });

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Link href="/admin/tournaments" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ← Tournaments
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.6rem" }}>
          <h1 style={{ fontWeight: "900", fontSize: "1.7rem", margin: 0 }}>{tournament.name}</h1>
          {tournament.isActive
            ? <span className="badge badge-live">ACTIVE</span>
            : <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>INACTIVE</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="glass" style={{ display: "inline-flex", gap: "0.3rem", padding: "0.35rem", borderRadius: "10px", marginBottom: "1.75rem" }}>
        <button style={tabStyle("settings")} onClick={() => setTab("settings")}>⚙ Settings</button>
        <button style={tabStyle("groups")} onClick={() => setTab("groups")}>🏷 Groups ({groups.length})</button>
        <button style={tabStyle("teams")} onClick={() => setTab("teams")}>👥 Teams ({teams.length})</button>
      </div>

      {error && (
        <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "var(--accent-danger)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div style={{ display: "grid", gap: "1.5rem", maxWidth: "680px" }}>
          {/* About */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: "900", fontSize: "0.95rem", marginBottom: "1rem" }}>About This Tournament</h3>
            <div>
              <label style={lbl}>Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={5}
                placeholder="Describe the tournament, its format, rules, etc."
                style={{ resize: "vertical", lineHeight: "1.6" }}
              />
            </div>
          </div>

          {/* Point rules */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: "900", fontSize: "0.95rem", marginBottom: "1rem" }}>Point System</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={lbl}>Win Points</label>
                <input type="number" min={0} max={10} value={winPts} onChange={(e) => setWinPts(Number(e.target.value))} style={{ border: "1px solid #10b981", textAlign: "center", fontWeight: "800", fontSize: "1.2rem" }} />
                <p style={{ color: "#10b981", fontSize: "0.7rem", textAlign: "center", margin: "0.3rem 0 0" }}>Win</p>
              </div>
              <div>
                <label style={lbl}>Draw Points</label>
                <input type="number" min={0} max={10} value={drawPts} onChange={(e) => setDrawPts(Number(e.target.value))} style={{ border: "1px solid var(--accent-primary)", textAlign: "center", fontWeight: "800", fontSize: "1.2rem" }} />
                <p style={{ color: "var(--accent-primary)", fontSize: "0.7rem", textAlign: "center", margin: "0.3rem 0 0" }}>Draw</p>
              </div>
              <div>
                <label style={lbl}>Loss Points</label>
                <input type="number" min={0} max={10} value={lossPts} onChange={(e) => setLossPts(Number(e.target.value))} style={{ border: "1px solid var(--accent-danger)", textAlign: "center", fontWeight: "800", fontSize: "1.2rem" }} />
                <p style={{ color: "var(--accent-danger)", fontSize: "0.7rem", textAlign: "center", margin: "0.3rem 0 0" }}>Loss</p>
              </div>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
              Standard: Win = 3 · Draw = 1 · Loss = 0. Stats are not auto-calculated — you update them manually in the Teams tab.
            </p>
          </div>

          {settingsSaved && <p style={{ color: "#10b981", fontWeight: "700", fontSize: "0.9rem" }}>✓ Settings saved!</p>}
          <button className="btn btn-primary" onClick={handleSaveSettings} disabled={isPending} style={{ width: "100%", padding: "0.8rem" }}>
            {isPending ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}

      {/* ── GROUPS TAB ────────────────────────────────────────────────── */}
      {tab === "groups" && (
        <div style={{ display: "grid", gap: "1.5rem", maxWidth: "680px" }}>
          {/* Create group */}
          <div className="glass" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: "800", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Add Group
            </h3>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                placeholder='e.g. "Group A" or "Semi-Finals"'
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleCreateGroup} disabled={isPending || !newGroupName.trim()} style={{ whiteSpace: "nowrap" }}>
                + Add
              </button>
            </div>
          </div>

          {/* Group list */}
          {groups.length === 0 ? (
            <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "12px" }}>
              <p style={{ color: "var(--text-muted)" }}>No groups yet. Add one above.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {groups.map((group) => {
                const groupTeams = teams.filter((t) => t.groupId === group.id);
                const ungrouped = teams.filter((t) => !t.groupId);
                return (
                  <div key={group.id} className="glass" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <div style={{ padding: "0.85rem 1.25rem", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
                      <span style={{ fontWeight: "800", fontSize: "1rem" }}>{group.name}</span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{groupTeams.length} team{groupTeams.length !== 1 ? "s" : ""}</span>
                        <button
                          className="btn glass"
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          disabled={isPending}
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem", color: "var(--accent-danger)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", minHeight: "50px" }}>
                      {groupTeams.length === 0 && (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", alignSelf: "center" }}>No teams assigned</span>
                      )}
                      {groupTeams.map((t) => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--bg-secondary)", borderRadius: "6px", padding: "0.3rem 0.7rem", border: "1px solid var(--border-color)" }}>
                          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>{t.batch.name}</span>
                          <button onClick={() => handleAssignGroup(t.id, "")} title="Remove from group" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1, padding: "0 0.1rem" }}>✕</button>
                        </div>
                      ))}
                    </div>
                    {/* Assign dropdown */}
                    {ungrouped.length > 0 && (
                      <div style={{ padding: "0.5rem 1.25rem 0.75rem", borderTop: "1px dashed var(--border-color)" }}>
                        <select
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) { handleAssignGroup(e.target.value, group.id); e.target.value = ""; } }}
                          style={{ fontSize: "0.82rem" }}
                        >
                          <option value="">+ Assign an ungrouped team…</option>
                          {ungrouped.map((t) => <option key={t.id} value={t.id}>{t.batch.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ungrouped teams indicator */}
          {teams.filter((t) => !t.groupId).length > 0 && (
            <div className="glass" style={{ padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px dashed var(--border-color)", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>Ungrouped:</span>
              {teams.filter((t) => !t.groupId).map((t) => (
                <span key={t.id} style={{ background: "var(--bg-secondary)", borderRadius: "6px", padding: "0.25rem 0.65rem", fontSize: "0.82rem", fontWeight: "700" }}>{t.batch.name}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TEAMS TAB ─────────────────────────────────────────────────── */}
      {tab === "teams" && (
        <>
          {/* Add team */}
          <div className="glass" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontWeight: "800", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Add Team</h3>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <select id="add-team-select" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} style={{ flex: 1 }}>
                <option value="">— Select a batch —</option>
                {availableBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button className="btn btn-primary" onClick={handleAddTeam} disabled={!selectedBatchId || isPending}>+ Add</button>
            </div>
            {availableBatches.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>All batches are already enrolled.</p>}
          </div>

          {/* Stats table */}
          <div className="glass responsive-table-container" style={{ padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "1rem 1.25rem" }}>Team</th>
                  <th style={{ padding: "1rem 0.5rem", textAlign: "center" }}>Group</th>
                  {statFields.map((f) => (
                    <th key={f.key} style={{ padding: "1rem 0.5rem", textAlign: "center", color: f.key === "points" ? "var(--accent-primary)" : "inherit" }}>{f.label}</th>
                  ))}
                  <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No teams yet. Add one above.</td></tr>
                ) : teams.map((team, index) => {
                  const isEditing = editingTeamId === team.id;
                  return (
                    <tr key={team.id} style={{ borderBottom: index === teams.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem 1.25rem", fontWeight: "700" }}>{team.batch.name}</td>
                      <td style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                        {groups.length > 0 ? (
                          <select
                            value={team.groupId ?? ""}
                            onChange={(e) => handleAssignGroup(team.id, e.target.value)}
                            style={{ width: 'auto', fontSize: "0.8rem" }}
                          >
                            <option value="">—</option>
                            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        ) : <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {statFields.map((f) => (
                        <td key={f.key} style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                          {isEditing ? (
                            <input type="number" min={0} value={editStats[f.key] as number ?? 0} onChange={(e) => setEditStats((prev) => ({ ...prev, [f.key]: e.target.value }))}
                              style={{ width: "52px", padding: "0.3rem 0.4rem", background: "var(--bg-secondary)", border: "1px solid var(--accent-primary)", borderRadius: "6px", color: "white", textAlign: "center", fontSize: "0.85rem" }} />
                          ) : (
                            <span style={{ fontWeight: f.key === "points" ? "900" : "600", color: f.key === "points" ? "var(--accent-primary)" : f.key === "goalsAgainst" ? "var(--text-muted)" : "inherit", fontSize: f.key === "points" ? "1.05rem" : "inherit" }}>
                              {team[f.key]}
                            </span>
                          )}
                        </td>
                      ))}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-primary" onClick={() => handleSaveStats(team.id)} disabled={isPending} style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}>Save</button>
                              <button className="btn glass" onClick={() => setEditingTeamId(null)} style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn glass" onClick={() => startEdit(team)} style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}>Edit Stats</button>
                              <button className="btn glass" onClick={() => handleRemoveTeam(team.id)} disabled={isPending} style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--accent-danger)" }}>Remove</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
