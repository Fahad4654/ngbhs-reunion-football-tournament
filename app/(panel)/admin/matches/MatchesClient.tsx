"use client";

import { useState, useTransition } from "react";
import { createMatch, updateMatch, deleteMatch } from "@/lib/actions/match.actions";
import { getFullMatchSquads } from "@/lib/actions/match-squad.actions";
import PrintSquad from "@/app/components/PrintSquad";
import PrintIcon from "@mui/icons-material/Print";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/app/components/ConfirmModal";
import CustomSelect from "@/app/components/panel/CustomSelect";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";

type Batch = { id: string; name: string };
type Tournament = { 
  id: string; 
  name: string; 
  isActive: boolean;
  teams: { batchId: string; groupId: string | null }[];
  groups: { id: string; name: string }[];
};
type Match = {
  id: string;
  date: Date;
  status: string;
  homeTeamId: string;
  homeTeam: Batch;
  homeScore: number;
  awayTeamId: string;
  awayTeam: Batch;
  awayScore: number;
  venue: string | null;
  isFeatured: boolean;
  isAlert: boolean;
  tournamentId: string | null;
  tournament: { id: string; name: string } | null;
  stage: string;
};

type FormData = {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue: string;
  tournamentId: string;
  status: string;
  homeScore: number;
  awayScore: number;
  isFeatured: boolean;
  isAlert: boolean;
  stage: string;
};

const STATUSES = ["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"];
const STAGES = ["GROUP_STAGE", "ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL", "THIRD_PLACE"];

function toDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyForm(): FormData {
  return {
    homeTeamId: "",
    awayTeamId: "",
    date: toDateTimeLocal(new Date()),
    venue: "",
    tournamentId: "",
    status: "SCHEDULED",
    homeScore: 0,
    awayScore: 0,
    isFeatured: false,
    isAlert: false,
    stage: "GROUP_STAGE",
  };
}

function matchToForm(m: Match): FormData {
  return {
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    date: toDateTimeLocal(new Date(m.date)),
    venue: m.venue ?? "",
    tournamentId: m.tournamentId ?? "",
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    isFeatured: m.isFeatured,
    isAlert: m.isAlert || false,
    stage: m.stage || "GROUP_STAGE",
  };
}


const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "700",
  fontSize: "0.72rem",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  letterSpacing: "0.07em",
  marginBottom: "0.35rem",
};

export default function MatchesClient({
  matches: initial,
  batches,
  tournaments,
}: {
  matches: Match[];
  batches: Batch[];
  tournaments: Tournament[];
}) {
  const [matches, setMatches] = useState(initial);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [printingMatch, setPrintingMatch] = useState<{ match: any, squads: any[] } | null>(null);
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  }

  function openEdit(match: Match) {
    setEditingId(match.id);
    setForm(matchToForm(match));
    setError("");
    setShowForm(true);
    setTimeout(() => document.getElementById("match-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function set(field: keyof FormData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.homeTeamId || !form.awayTeamId) { setError("Both teams are required"); return; }
    if (form.homeTeamId === form.awayTeamId) { setError("Home and away team cannot be the same"); return; }
    
    // Group Validation
    if (form.tournamentId) {
      const tournament = tournaments.find(t => t.id === form.tournamentId);
      if (tournament) {
        const homeTeam = tournament.teams.find(t => t.batchId === form.homeTeamId);
        const awayTeam = tournament.teams.find(t => t.batchId === form.awayTeamId);
        
        if (!homeTeam || !awayTeam) {
          setError("One or both teams are not registered for this tournament");
          return;
        }
        
        if (form.stage === "GROUP_STAGE" && homeTeam.groupId !== awayTeam.groupId) {
          setError("Teams must be in the same group for group stage matches");
          return;
        }
      }
    }
    
    setError("");

    startTransition(async () => {
      const payload = { ...form, homeScore: Number(form.homeScore), awayScore: Number(form.awayScore) };
      const res = editingId ? await updateMatch(editingId, payload) : await createMatch(payload);

      if (res.success && res.data) {
        if (editingId) {
          setMatches((prev) => prev.map((m) => (m.id === editingId ? (res.data as Match) : m)));
        } else {
          setMatches((prev) => [res.data as Match, ...prev]);
        }
        closeForm();
      } else {
        setError(res.error ?? "Operation failed");
      }
    });
  }

  function handleDelete(id: string, label: string) {
    askConfirm(
      `Delete match "${label}"?`,
      () => {
        startTransition(async () => {
          const res = await deleteMatch(id);
          if (res.success) {
            setMatches((prev) => prev.filter((m) => m.id !== id));
            if (editingId === id) closeForm();
          } else {
            setError(res.error ?? "Failed to delete match");
          }
        });
      },
      { subMessage: 'This cannot be undone.', confirmLabel: 'Delete Match' }
    );
  }

  async function handlePrint(match: any) {
    const squads = await getFullMatchSquads(match.id);
    if (squads.length === 0) {
      toast.error("No squad announced for this match yet.");
      return;
    }
    setPrintingMatch({ match, squads });
  }

  const statusColor: Record<string, string> = {
    LIVE: "var(--accent-danger)",
    FINISHED: "#10b981",
    SCHEDULED: "var(--text-muted)",
    CANCELLED: "var(--text-muted)",
  };

  return (
    <>
      {confirmModal}
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {matches.length} match{matches.length !== 1 ? "es" : ""}
        </p>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create New Match
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--accent-danger)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* ─── Match Form ─────────────────────────────── */}
      {showForm && (
        <div id="match-form" className="glass" style={{ padding: "1.75rem", borderRadius: "14px", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontWeight: "900", margin: 0, fontSize: "1.15rem" }}>
              {editingId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <EditIcon sx={{ fontSize: '1.2rem' }} /> Edit Match
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AddIcon sx={{ fontSize: '1.2rem' }} /> New Match
                </div>
              )}
            </h3>
            <button className="btn glass" onClick={closeForm} style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}>✕ Cancel</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {/* Tournament */}
              <div style={{ gridColumn: "span 2" }}>
                <CustomSelect 
                  label="Tournament"
                  value={form.tournamentId} 
                  onChange={(e) => set("tournamentId", e.target.value)}
                >
                  <option value="">— Generic Match (No Tournament) —</option>
                  {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}{t.isActive ? " (Active)" : ""}</option>)}
                </CustomSelect>
                {form.tournamentId && (
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.7rem", color: "var(--accent-primary)", fontWeight: "600", display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <InfoIcon sx={{ fontSize: '0.9rem' }} /> Team selection is restricted to the same group for Group Stage matches only.
                  </p>
                )}
              </div>

              {/* Home Team */}
              <div>
                <CustomSelect 
                  label="Home Team"
                  value={form.homeTeamId} 
                  onChange={(e) => set("homeTeamId", e.target.value)} 
                  required
                >
                  <option value="">— Select —</option>
                  {batches.filter(b => {
                    if (!form.tournamentId) return true;
                    const tournament = tournaments.find(t => t.id === form.tournamentId);
                    return tournament?.teams.some(t => t.batchId === b.id);
                  }).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </CustomSelect>
              </div>

              {/* Away Team */}
              <div>
                <CustomSelect 
                  label="Away Team"
                  value={form.awayTeamId} 
                  onChange={(e) => set("awayTeamId", e.target.value)} 
                  required
                >
                  <option value="">— Select —</option>
                  {batches.filter(b => {
                    if (!form.tournamentId) return true;
                    const tournament = tournaments.find(t => t.id === form.tournamentId);
                    if (!tournament) return false;
                    
                    const isRegistered = tournament.teams.some(t => t.batchId === b.id);
                    if (!isRegistered) return false;

                    if (form.homeTeamId && form.stage === "GROUP_STAGE") {
                      const homeTeamInfo = tournament.teams.find(t => t.batchId === form.homeTeamId);
                      const awayTeamInfo = tournament.teams.find(t => t.batchId === b.id);
                      return homeTeamInfo?.groupId === awayTeamInfo?.groupId;
                    }
                    return true;
                  }).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </CustomSelect>
              </div>

              {/* Date & Time */}
              <div>
                <label style={labelStyle}>Date & Time</label>
                <input type="datetime-local" value={form.date} onChange={(e) => set("date", e.target.value)} required />
              </div>

              {/* Venue */}
              <div>
                <label style={labelStyle}>Venue</label>
                <input type="text" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Main Stadium" />
              </div>

              {/* Stage */}
              <div>
                <CustomSelect 
                  label="Stage"
                  value={form.stage} 
                  onChange={(e) => set("stage", e.target.value)}
                >
                  {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </CustomSelect>
              </div>

              {/* Status */}
              <div>
                <CustomSelect 
                  label="Status"
                  value={form.status} 
                  onChange={(e) => set("status", e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </CustomSelect>
              </div>

            </div>

            {/* Featured and Alert toggles */}
            <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px" }} />
                Mark as Featured Match
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={form.isAlert} onChange={(e) => set("isAlert", e.target.checked)} style={{ accentColor: "var(--accent-danger)", width: "16px", height: "16px" }} />
                Mark as Alert
              </label>
            </div>

            {error && <p style={{ color: "var(--accent-danger)", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn btn-primary" disabled={isPending} style={{ flex: 1 }}>
                {isPending ? "Saving..." : editingId ? "Update Match" : "Create Match"}
              </button>
              <button type="button" className="btn glass" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Matches Table ───────────────────────────── */}
      <div className="glass responsive-table-container" style={{ padding: 0 }}>
        <table className="sticky-table" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1.25rem" }}>Date & Time</th>
              <th style={{ padding: "1.25rem" }}>Matchup</th>
              <th style={{ padding: "1.25rem" }}>Score</th>
              <th style={{ padding: "1.25rem" }}>Status</th>
              <th style={{ padding: "1.25rem" }}>Tournament</th>
              <th className="sticky-actions" style={{ padding: "1.25rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No matches yet. Create one above.
                </td>
              </tr>
            ) : [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => {
              const label = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
              const d = new Date(match.date);
              const isEditing = editingId === match.id;
              return (
                <tr key={match.id} style={{ background: isEditing ? "rgba(235,183,0,0.06)" : "" }}>
                  <td>
                    <div style={{ fontWeight: "600" }}>{d.toLocaleDateString()}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: "700" }}>{match.homeTeam.name}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>vs</span>
                      <span style={{ fontWeight: "700" }}>{match.awayTeam.name}</span>
                      {match.isFeatured && <span className="badge" style={{ fontSize: "0.65rem", background: "rgba(235,183,0,0.15)", color: "var(--accent-primary)", border: "1px solid rgba(235,183,0,0.3)" }}>★ Featured</span>}
                      {match.isAlert && <span className="badge" style={{ fontSize: "0.65rem", background: "rgba(255,68,68,0.15)", color: "var(--accent-danger)", border: "1px solid rgba(255,68,68,0.3)" }}>🚨 Alert</span>}
                    </div>
                    {match.venue && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{match.venue}</div>}
                  </td>
                  <td>
                    <div style={{ background: "var(--bg-secondary)", padding: "0.2rem 0.65rem", borderRadius: "6px", display: "inline-block", fontFamily: "monospace", fontWeight: "800", fontSize: "1.05rem", letterSpacing: "0.05em" }}>
                      {match.homeScore} – {match.awayScore}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${match.status === "LIVE" ? "badge-live" : ""}`} style={{ background: "rgba(255,255,255,0.05)", color: statusColor[match.status] ?? "inherit", border: "1px solid currentColor" }}>
                      {match.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    {match.tournament?.name ?? <span style={{ opacity: 0.4 }}>—</span>}
                  </td>
                  <td className="sticky-actions" style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        className="btn glass"
                        onClick={() => handlePrint(match)}
                        title="Print Squad List"
                        style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                      >
                        <PrintIcon sx={{ fontSize: '1.1rem' }} />
                      </button>
                      <button
                        className="btn glass"
                        onClick={() => openEdit(match)}
                        disabled={isPending}
                        style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn glass"
                        onClick={() => handleDelete(match.id, label)}
                        disabled={isPending}
                        style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--accent-danger)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {printingMatch && (
        <PrintSquad 
          match={printingMatch.match} 
          squads={printingMatch.squads} 
          onClose={() => setPrintingMatch(null)} 
        />
      )}
    </>
  );
}
