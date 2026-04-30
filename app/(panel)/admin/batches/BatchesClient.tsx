"use client";

import { useState, useTransition } from "react";
import { createBatch, updateBatchName, deleteBatch } from "@/lib/actions/batch.actions";

type Batch = {
  id: string;
  name: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  _count: { members: number };
};

export default function BatchesClient({ batches: initial }: { batches: Batch[] }) {
  const [batches, setBatches] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // ── Create ──────────────────────────────────────
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createBatch(newName);
      if (res.success && res.data) {
        setBatches((prev) => [
          ...prev,
          { ...res.data!, _count: { members: 0 } },
        ]);
        setNewName("");
        setShowForm(false);
      } else {
        setError(res.error ?? "Failed to create batch");
      }
    });
  }

  // ── Edit ────────────────────────────────────────
  function startEdit(batch: Batch) {
    setEditingId(batch.id);
    setEditName(batch.name);
    setError("");
  }

  function handleUpdate(id: string) {
    setError("");
    startTransition(async () => {
      const res = await updateBatchName(id, editName);
      if (res.success && res.data) {
        setBatches((prev) =>
          prev.map((b) => (b.id === id ? { ...b, name: res.data!.name } : b))
        );
        setEditingId(null);
      } else {
        setError(res.error ?? "Failed to update batch");
      }
    });
  }

  // ── Delete ──────────────────────────────────────
  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const res = await deleteBatch(id);
      if (res.success) {
        setBatches((prev) => prev.filter((b) => b.id !== id));
      } else {
        setError(res.error ?? "Failed to delete batch");
      }
    });
  }

  return (
    <>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {batches.length} batch{batches.length !== 1 ? "es" : ""} registered
        </p>
        <button
          id="create-batch-btn"
          className="btn btn-primary"
          onClick={() => { setShowForm((v) => !v); setError(""); }}
        >
          {showForm ? "✕ Cancel" : "+ Register New Batch"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass"
          style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid var(--border-color)", display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              htmlFor="batch-name-input"
              style={{ display: "block", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "0.4rem" }}
            >
              Batch / Team Name
            </label>
            <input
              id="batch-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='e.g. "Batch 2005" or "Lions FC"'
              required
              autoFocus
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "white",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending || !newName.trim()}
            style={{ whiteSpace: "nowrap", height: "42px" }}
          >
            {isPending ? "Creating…" : "Create Batch"}
          </button>
        </form>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--accent-danger)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* Batches table */}
      <div className="glass responsive-table-container" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1.25rem" }}>Batch / Team</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>Members</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>P</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>W</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>D</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>L</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>GD</th>
              <th style={{ padding: "1.25rem", textAlign: "center" }}>PTS</th>
              <th style={{ padding: "1.25rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No batches yet. Register one above.
                </td>
              </tr>
            ) : batches.map((batch) => {
              const isEditing = editingId === batch.id;
              const gd = batch.goalsFor - batch.goalsAgainst;
              return (
                <tr key={batch.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "1.25rem" }}>
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(batch.id); if (e.key === "Escape") setEditingId(null); }}
                        style={{
                          padding: "0.4rem 0.75rem",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--accent-primary)",
                          borderRadius: "6px",
                          color: "white",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          width: "100%",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <>
                        <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{batch.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          {batch._count.members} member{batch._count.members !== 1 ? "s" : ""}
                        </div>
                      </>
                    )}
                  </td>
                  <td style={{ padding: "1.25rem", textAlign: "center", color: "var(--text-muted)" }}>{batch._count.members}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center" }}>{batch.played}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center" }}>{batch.won}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center" }}>{batch.drawn}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center" }}>{batch.lost}</td>
                  <td style={{ padding: "1.25rem", textAlign: "center", fontWeight: "600", color: gd >= 0 ? "var(--accent-primary)" : "var(--accent-danger)" }}>
                    {gd > 0 ? `+${gd}` : gd}
                  </td>
                  <td style={{ padding: "1.25rem", textAlign: "center", fontWeight: "800", fontSize: "1.15rem", color: "var(--accent-primary)" }}>
                    {batch.points}
                  </td>
                  <td style={{ padding: "1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleUpdate(batch.id)}
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
                          <button
                            className="btn glass"
                            onClick={() => startEdit(batch)}
                            disabled={isPending}
                            style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem" }}
                          >
                            Rename
                          </button>
                          <button
                            className="btn glass"
                            onClick={() => handleDelete(batch.id, batch.name)}
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
