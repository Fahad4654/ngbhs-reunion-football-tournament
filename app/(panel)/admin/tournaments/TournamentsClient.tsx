"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createTournament,
  toggleTournamentActiveStatus,
  renameTournament,
  deleteTournament,
} from "@/lib/actions/tournament.actions";
import { useConfirm } from "@/app/components/ConfirmModal";

type Tournament = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  _count: { teams: number; matches: number };
};

const STAGES = ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL", "THIRD_PLACE"];

type BracketMatch = { id: string; home: string; away: string };
type BracketStage = { stage: string; matches: BracketMatch[] };

export default function TournamentsClient({ tournaments: initial }: { tournaments: Tournament[] }) {
  const [tournaments, setTournaments] = useState(initial);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [makeActive, setMakeActive] = useState(false);
  
  // Bracket config state
  const [bracketStages, setBracketStages] = useState<BracketStage[]>([]);

  // Bracket Helpers
  const addStage = () => setBracketStages([...bracketStages, { stage: STAGES[0], matches: [] }]);
  const removeStage = (sIdx: number) => setBracketStages(bracketStages.filter((_, i) => i !== sIdx));
  const addMatch = (sIdx: number) => {
    const newStages = [...bracketStages];
    newStages[sIdx].matches.push({ id: `M${Math.random().toString(36).substr(2, 5).toUpperCase()}`, home: "", away: "" });
    setBracketStages(newStages);
  };
  const removeMatch = (sIdx: number, mIdx: number) => {
    const newStages = [...bracketStages];
    newStages[sIdx].matches = newStages[sIdx].matches.filter((_, i) => i !== mIdx);
    setBracketStages(newStages);
  };
  const updateMatch = (sIdx: number, mIdx: number, field: "home" | "away", val: string) => {
    const newStages = [...bracketStages];
    newStages[sIdx].matches[mIdx][field] = val;
    setBracketStages(newStages);
  };
  const updateStageName = (sIdx: number, val: string) => {
    const newStages = [...bracketStages];
    newStages[sIdx].stage = val;
    setBracketStages(newStages);
  };

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  // ── Create ───────────────────────────────
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await createTournament(name.trim(), makeActive, bracketStages.length > 0 ? bracketStages : null);
      if (res.success) {
        setName("");
        setMakeActive(false);
        setShowForm(false);
        window.location.reload();
      } else {
        setError(res.error || "Failed to create tournament");
      }
    });
  }

  // ── Set Active ───────────────────────────
  function handleSetActive(id: string) {
    startTransition(async () => {
      const res = await toggleTournamentActiveStatus(id);
      if (res.success) {
        setTournaments((prev) => prev.map((t) => ({ ...t, isActive: t.id === id })));
      }
    });
  }

  // ── Rename ───────────────────────────────
  function startEdit(t: Tournament) {
    setEditingId(t.id);
    setEditName(t.name);
    setError("");
  }

  function handleRename(id: string) {
    setError("");
    startTransition(async () => {
      const res = await renameTournament(id, editName);
      if (res.success && res.data) {
        setTournaments((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name: res.data!.name } : t))
        );
        setEditingId(null);
      } else {
        setError(res.error || "Failed to rename tournament");
      }
    });
  }

  // ── Delete ───────────────────────────────
  function handleDelete(id: string, tName: string) {
    askConfirm(
      `Delete "${tName}"?`,
      () => {
        setError("");
        startTransition(async () => {
          const res = await deleteTournament(id);
          if (res.success) {
            setTournaments((prev) => prev.filter((t) => t.id !== id));
          } else {
            setError(res.error || "Failed to delete tournament");
          }
        });
      },
      { subMessage: 'All team entries for this tournament will also be removed.', confirmLabel: 'Delete Tournament' }
    );
  }

  return (
    <>
      {confirmModal}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} total
        </p>
        <button className="btn btn-primary" onClick={() => { setShowForm((v) => !v); setError(""); }}>
          {showForm ? "✕ Cancel" : "+ Create Tournament"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: "800" }}>New Tournament</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Tournament Name
              </label>
              <input
                id="tournament-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NGBHS Reunion Cup 2026"
                required
                autoFocus
                style={{ width: "100%", padding: "0.75rem 1rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "white", fontSize: "0.95rem", outline: "none" }}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px" }}
              />
              Set as the active tournament (replaces current active)
            </label>
            {/* Bracket Builder */}
            <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ margin: 0, fontWeight: "700", fontSize: "0.95rem" }}>Bracket Configuration (Optional)</h4>
                <button type="button" onClick={addStage} className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                  + Add Stage
                </button>
              </div>
              
              {bracketStages.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>No knockout stages defined yet. You can add them now to pre-declare matchups.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {bracketStages.map((stage, sIdx) => (
                    <div key={sIdx} style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", position: "relative" }}>
                      <button type="button" onClick={() => removeStage(sIdx)} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "transparent", border: "none", color: "var(--accent-danger)", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
                      <div style={{ marginBottom: "1rem" }}>
                        <select 
                          value={stage.stage} 
                          onChange={(e) => updateStageName(sIdx, e.target.value)}
                          style={{ padding: "0.4rem 0.5rem", background: "var(--bg-secondary)", color: "white", border: "1px solid var(--border-color)", borderRadius: "4px" }}
                        >
                          {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                        </select>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {stage.matches.map((m, mIdx) => (
                          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1fr auto", gap: "0.5rem", alignItems: "center", fontSize: "0.85rem" }}>
                            <span style={{ fontWeight: "700", color: "var(--accent-primary)" }}>{m.id}</span>
                            <input type="text" value={m.home} onChange={e => updateMatch(sIdx, mIdx, "home", e.target.value)} placeholder="Home (e.g. Winner A)" style={{ padding: "0.4rem", background: "rgba(0,0,0,0.3)", color: "white", border: "1px solid var(--border-color)", borderRadius: "4px", width: "100%" }} />
                            <span>vs</span>
                            <input type="text" value={m.away} onChange={e => updateMatch(sIdx, mIdx, "away", e.target.value)} placeholder="Away (e.g. Runner-up B)" style={{ padding: "0.4rem", background: "rgba(0,0,0,0.3)", color: "white", border: "1px solid var(--border-color)", borderRadius: "4px", width: "100%" }} />
                            <button type="button" onClick={() => removeMatch(sIdx, mIdx)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>&times;</button>
                          </div>
                        ))}
                      </div>
                      
                      <button type="button" onClick={() => addMatch(sIdx)} style={{ marginTop: "1rem", background: "transparent", border: "1px dashed var(--border-color)", color: "var(--text-muted)", padding: "0.4rem", borderRadius: "4px", width: "100%", cursor: "pointer", fontSize: "0.85rem" }}>
                        + Add Match
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: "100%" }}>
              {isPending ? "Creating..." : "Create Tournament"}
            </button>
          </form>
        </div>
      )}

      {/* Error banner (outside form) */}
      {error && !showForm && (
        <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--accent-danger)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* Tournaments List */}
      <div className="glass responsive-table-container" style={{ padding: 0 }}>
        <table className="sticky-table" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1.25rem" }}>Tournament</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Teams</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Matches</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Status</th>
              <th className="sticky-actions" style={{ padding: "1.25rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No tournaments yet. Create one above.
                </td>
              </tr>
            ) : tournaments.map((t) => {
              const isEditing = editingId === t.id;
              return (
                <tr key={t.id}>
                  {/* Name cell — editable inline */}
                  <td>
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRename(t.id); if (e.key === "Escape") setEditingId(null); }}
                        style={{ padding: "0.4rem 0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--accent-primary)", borderRadius: "6px", color: "white", fontSize: "0.95rem", fontWeight: "700", width: "100%", outline: "none" }}
                      />
                    ) : (
                      <>
                        <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{t.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          Created {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </td>

                  <td style={{ textAlign: "center", fontWeight: "700" }}>{t._count.teams}</td>
                  <td style={{ textAlign: "center", fontWeight: "700" }}>{t._count.matches}</td>

                  <td style={{ textAlign: "center" }}>
                    {t.isActive ? (
                      <span className="badge badge-live">ACTIVE</span>
                    ) : (
                      <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                        INACTIVE
                      </span>
                    )}
                  </td>

                  <td className="sticky-actions" style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleRename(t.id)}
                            disabled={isPending || !editName.trim()}
                            style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                          >
                            Save
                          </button>
                          <button
                            className="btn glass"
                            onClick={() => setEditingId(null)}
                            style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin/tournaments/${t.id}`}
                            className="btn glass"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.72rem" }}
                          >
                            Manage
                          </Link>
                          <button
                            className="btn glass"
                            onClick={() => startEdit(t)}
                            disabled={isPending}
                            style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                          >
                            Rename
                          </button>
                          {!t.isActive && (
                            <button
                              className="btn glass"
                              onClick={() => handleSetActive(t.id)}
                              disabled={isPending}
                              style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--accent-primary)", border: "1px solid rgba(235, 183, 0, 0.3)" }}
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            className="btn glass"
                            onClick={() => handleDelete(t.id, t.name)}
                            disabled={isPending}
                            style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--accent-danger)" }}
                          >
                            Delete
                          </button>
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
  );
}
