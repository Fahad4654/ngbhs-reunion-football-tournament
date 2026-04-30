"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createTournament, toggleTournamentActiveStatus } from "@/lib/actions/tournament.actions";

type Tournament = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  _count: { teams: number; matches: number };
};

export default function TournamentsClient({ tournaments: initial }: { tournaments: Tournament[] }) {
  const [tournaments, setTournaments] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [makeActive, setMakeActive] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");

    startTransition(async () => {
      const res = await createTournament(name.trim(), makeActive);
      if (res.success) {
        setName("");
        setMakeActive(false);
        setShowForm(false);
        // Optimistic: reload is triggered by revalidatePath, just reset form
        window.location.reload();
      } else {
        setError(res.error || "Failed to create tournament");
      }
    });
  }

  function handleSetActive(id: string) {
    startTransition(async () => {
      const res = await toggleTournamentActiveStatus(id);
      if (res.success) {
        setTournaments((prev) =>
          prev.map((t) => ({ ...t, isActive: t.id === id }))
        );
      }
    });
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
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
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
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
            {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn btn-primary" disabled={isPending} style={{ flex: 1 }}>
                {isPending ? "Creating..." : "Create Tournament"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournaments List */}
      <div className="glass responsive-table-container" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1.25rem" }}>Tournament</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Teams</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Matches</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Status</th>
              <th style={{ padding: "1.25rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No tournaments yet. Create one above.
                </td>
              </tr>
            ) : (
              tournaments.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "1.25rem" }}>
                    <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Created {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem", textAlign: "center", fontWeight: "700" }}>{t._count.teams}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center", fontWeight: "700" }}>{t._count.matches}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center" }}>
                    {t.isActive ? (
                      <span className="badge badge-live">ACTIVE</span>
                    ) : (
                      <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <Link
                        href={`/admin/tournaments/${t.id}`}
                        className="btn glass"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                      >
                        Manage
                      </Link>
                      {!t.isActive && (
                        <button
                          className="btn glass"
                          onClick={() => handleSetActive(t.id)}
                          disabled={isPending}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "var(--accent-primary)", border: "1px solid rgba(235, 183, 0, 0.3)" }}
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
