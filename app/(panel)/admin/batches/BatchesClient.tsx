"use client";

import { useState, useTransition } from "react";
import { createBatch, updateBatch, deleteBatch } from "@/lib/actions/batch.actions";
import LogoUploader from "@/app/components/LogoUploader";

type Batch = {
  id: string;
  name: string;
  year: number;
  nickname: string | null;
  logoUrl: string | null;
  slogan: string | null;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  _count: { members: number };
};

type EditForm = { nickname: string; logoUrl: string; slogan: string };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.9rem",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border-color)",
  borderRadius: "8px",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "700",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  letterSpacing: "0.07em",
  marginBottom: "0.3rem",
};

export default function BatchesClient({ batches: initial }: { batches: Batch[] }) {
  const [batches, setBatches] = useState(initial);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newLogo, setNewLogo] = useState("");
  const [newSlogan, setNewSlogan] = useState("");

  // Edit panel
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ nickname: "", logoUrl: "", slogan: "" });

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // ── Create ──────────────────────────────
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const year = parseInt(newYear);
    if (!year || year < 1900 || year > 2100) { setError("Enter a valid year"); return; }
    setError("");
    startTransition(async () => {
      const res = await createBatch({ year, nickname: newNickname, logoUrl: newLogo, slogan: newSlogan });
      if (res.success && res.data) {
        setBatches((prev) => [{ ...res.data!, _count: { members: 0 } }, ...prev].sort((a, b) => a.year - b.year));
        setNewYear(""); setNewNickname(""); setNewLogo(""); setNewSlogan("");
        setShowCreate(false);
      } else {
        setError(res.error ?? "Failed to create batch");
      }
    });
  }

  // ── Edit ────────────────────────────────
  function startEdit(batch: Batch) {
    setEditingId(batch.id);
    setEditForm({ nickname: batch.nickname ?? "", logoUrl: batch.logoUrl ?? "", slogan: batch.slogan ?? "" });
    setError("");
  }

  function handleUpdate(id: string) {
    setError("");
    startTransition(async () => {
      const res = await updateBatch(id, editForm);
      if (res.success && res.data) {
        setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, ...res.data } : b)));
        setEditingId(null);
      } else {
        setError(res.error ?? "Failed to update");
      }
    });
  }

  // ── Delete ──────────────────────────────
  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteBatch(id);
      if (res.success) {
        setBatches((prev) => prev.filter((b) => b.id !== id));
        if (editingId === id) setEditingId(null);
      } else {
        setError(res.error ?? "Failed to delete");
      }
    });
  }

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {batches.length} batch{batches.length !== 1 ? "es" : ""} registered
        </p>
        <button className="btn btn-primary" onClick={() => { setShowCreate((v) => !v); setError(""); }}>
          {showCreate ? "✕ Cancel" : "+ Register New Batch"}
        </button>
      </div>

      {/* ── Create Form ── */}
      {showCreate && (
        <form onSubmit={handleCreate} className="glass" style={{ padding: "1.5rem", borderRadius: "14px", marginBottom: "1.5rem", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontWeight: "900", marginBottom: "1.25rem", fontSize: "1.05rem" }}>Register New Batch</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Year — required */}
            <div>
              <label style={labelStyle}>Graduating Year <span style={{ color: "var(--accent-danger)" }}>*</span></label>
              <input
                id="batch-year"
                type="number"
                min={1950}
                max={currentYear + 5}
                value={newYear}
                onChange={(e) => {
                  setNewYear(e.target.value);
                }}
                placeholder={`e.g. ${currentYear - 10}`}
                required
                autoFocus
                style={{ ...inputStyle, border: "1px solid var(--accent-primary)" }}
              />
              {newYear && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                  Name will be: <strong style={{ color: "white" }}>Batch {newYear}</strong>
                </p>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label style={labelStyle}>Nickname (optional)</label>
              <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} placeholder='e.g. "The Lions"' style={inputStyle} />
            </div>

            {/* Logo */}
            <div>
              <label style={labelStyle}>Logo</label>
              <LogoUploader currentUrl={newLogo} onChange={setNewLogo} />
            </div>

            {/* Slogan */}
            <div>
              <label style={labelStyle}>Slogan (optional)</label>
              <input type="text" value={newSlogan} onChange={(e) => setNewSlogan(e.target.value)} placeholder='e.g. "Born to Win"' style={inputStyle} />
            </div>
          </div>

          {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.75rem" }}>{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={isPending || !newYear} style={{ marginTop: "1.25rem", width: "100%" }}>
            {isPending ? "Creating…" : "Create Batch"}
          </button>
        </form>
      )}

      {/* Error banner */}
      {error && !showCreate && (
        <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--accent-danger)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* ── Edit Panel ── */}
      {editingId && (() => {
        const batch = batches.find((b) => b.id === editingId);
        if (!batch) return null;
        return (
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "14px", marginBottom: "1.5rem", border: "1px solid var(--accent-primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ fontWeight: "900", margin: 0, fontSize: "1.05rem" }}>Edit: {batch.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0.2rem 0 0" }}>Year cannot be changed after creation.</p>
              </div>
              <button className="btn glass" onClick={() => setEditingId(null)} style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Nickname</label>
                <input type="text" value={editForm.nickname} onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="e.g. The Lions" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Logo</label>
                <LogoUploader currentUrl={editForm.logoUrl} onChange={(url) => setEditForm((f) => ({ ...f, logoUrl: url }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Slogan</label>
                <input type="text" value={editForm.slogan} onChange={(e) => setEditForm((f) => ({ ...f, slogan: e.target.value }))} placeholder="e.g. Born to Win" style={inputStyle} />
              </div>
            </div>
            {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.75rem" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button className="btn btn-primary" onClick={() => handleUpdate(editingId)} disabled={isPending} style={{ flex: 1 }}>
                {isPending ? "Saving…" : "Save Changes"}
              </button>
              <button className="btn glass" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* ── Batches Table ── */}
      <div className="glass responsive-table-container" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1.25rem" }}>Batch</th>
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
              const gd = batch.goalsFor - batch.goalsAgainst;
              const isActiveEdit = editingId === batch.id;
              return (
                <tr key={batch.id} style={{ borderBottom: "1px solid var(--border-color)", background: isActiveEdit ? "rgba(235,183,0,0.04)" : "transparent" }}>
                  <td style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {batch.logoUrl ? (
                        <img src={batch.logoUrl} alt={batch.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                      ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "var(--accent-primary)", fontSize: "0.85rem", flexShrink: 0 }}>
                          {batch.year.toString().slice(-2)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "1rem" }}>{batch.name}</div>
                        {batch.nickname && <div style={{ fontSize: "0.75rem", color: "var(--accent-secondary)", fontWeight: "700" }}>"{batch.nickname}"</div>}
                        {batch.slogan && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic" }}>{batch.slogan}</div>}
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{batch._count.members} member{batch._count.members !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
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
                      <button className="btn glass" onClick={() => startEdit(batch)} disabled={isPending} style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: isActiveEdit ? "var(--accent-primary)" : "inherit" }}>
                        Edit
                      </button>
                      <button className="btn glass" onClick={() => handleDelete(batch.id, batch.name)} disabled={isPending} style={{ padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--accent-danger)" }}>
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
    </>
  );
}
