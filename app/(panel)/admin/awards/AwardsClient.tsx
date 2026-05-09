"use client";

import { useState } from "react";
import { upsertSeasonAward } from "@/lib/actions/stats.actions";
import { toast } from "react-hot-toast";
import CustomSelect from "@/app/components/panel/CustomSelect";

// ─── Styled Label ───────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "0.7rem",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--text-muted)",
      marginBottom: "0.4rem",
      fontFamily: "Outfit, sans-serif",
    }}>
      {children}
    </div>
  );
}



// ─── Player chip component ─────────────────────────────────────────────────
function PlayerChip({ user, onRemove }: { user: any; onRemove: () => void }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.3rem 0.5rem 0.3rem 0.4rem",
      background: "rgba(235, 183, 0, 0.12)",
      border: "1px solid rgba(235, 183, 0, 0.35)",
      borderRadius: "6px",
      fontSize: "0.78rem",
      fontWeight: 700,
      color: "var(--accent-secondary)",
      animation: "fadeIn 0.15s ease",
    }}>
      <img
        src={user.image || "/default-avatar.png"}
        alt={user.name || ""}
        style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
      />
      <span>{user.name}</span>
      <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.7rem" }}>
        {user.batch?.name || "No Batch"}
      </span>
      <button
        onClick={onRemove}
        title="Remove"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "0.85rem",
          lineHeight: 1,
          padding: "0 0.1rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Award Form ──────────────────────────────────────────────────────────────
function AwardForm({ category, title, icon, maxPlayers, initialData, users }: any) {
  const [playerIds, setPlayerIds] = useState<string[]>(
    initialData?.players.map((p: any) => p.id) || []
  );
  const [coachId, setCoachId] = useState<string>(initialData?.coach?.id || "");
  const [captainId, setCaptainId] = useState<string>(initialData?.captain?.id || "");
  const [desc, setDesc] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u: any) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) &&
      !playerIds.includes(u.id)
  );

  const handleSave = async () => {
    setLoading(true);
    const res = await upsertSeasonAward({
      category,
      title,
      description: desc,
      playerIds,
      coachId: coachId || undefined,
      captainId: captainId || undefined,
    });
    setLoading(false);
    if (res?.success === false) {
      toast.error(res.error || "Failed to save. Please try again.");
    } else {
      toast.success(`${title} saved successfully!`);
    }
  };

  const filled = playerIds.length;
  const pct = Math.round((filled / maxPlayers) * 100);

  return (
    <div
      className="glass"
      style={{
        borderRadius: "14px",
        marginBottom: "2rem",
        overflow: "hidden",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-color)",
          background: "rgba(235, 183, 0, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>{icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
              {filled} of {maxPlayers} players selected
            </p>
          </div>
        </div>
        {/* Progress Pill */}
        <div style={{
          background: "rgba(235,183,0,0.08)",
          border: "1px solid rgba(235,183,0,0.2)",
          borderRadius: "999px",
          padding: "0.25rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: 800,
          color: pct === 100 ? "var(--accent-primary)" : "var(--text-muted)",
        }}>
          {pct}%
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: "3px", background: "var(--bg-secondary)", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: "1.5rem" }}>

        {/* Description */}
        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>Description / Note</FieldLabel>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="Optional description or note about this selection..."
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Coach & Captain */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <CustomSelect
              label="👔 Coach"
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
            >
              <option value="">— Select Coach —</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.batch?.name || "No Batch"})
                </option>
              ))}
            </CustomSelect>
          </div>
          <div>
            <CustomSelect
              label="🏅 Captain"
              value={captainId}
              onChange={(e) => setCaptainId(e.target.value)}
            >
              <option value="">— Select Captain —</option>
              {playerIds.map((id) => {
                const u = users.find((u: any) => u.id === id);
                return u ? (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.batch?.name || "No Batch"})
                  </option>
                ) : null;
              })}
            </CustomSelect>
          </div>
        </div>

        {/* Players Section */}
        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>⚽ Players ({filled} / {maxPlayers})</FieldLabel>

          {/* Chips */}
          {playerIds.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
              {playerIds.map((id) => {
                const u = users.find((u: any) => u.id === id);
                if (!u) return null;
                return (
                  <PlayerChip
                    key={id}
                    user={u}
                    onRemove={() => setPlayerIds((prev) => prev.filter((p) => p !== id))}
                  />
                );
              })}
            </div>
          )}

          {/* Search */}
          {playerIds.length < maxPlayers && (
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="🔍  Search and add players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  zIndex: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}>
                  {filteredUsers.length === 0 ? (
                    <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                      No matching players found
                    </div>
                  ) : filteredUsers.slice(0, 12).map((u: any) => (
                    <div
                      key={u.id}
                      onClick={() => { setPlayerIds((prev) => [...prev, u.id]); setSearch(""); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(235,183,0,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <img
                        src={u.image || "/default-avatar.png"}
                        alt={u.name || ""}
                        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {u.batch?.name || "No Batch"} {u.teamRole ? `• ${u.teamRole}` : ""}
                        </div>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--accent-primary)", fontWeight: 700 }}>+ ADD</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {playerIds.length >= maxPlayers && (
            <div style={{
              padding: "0.5rem 0.75rem",
              background: "rgba(235,183,0,0.06)",
              border: "1px solid rgba(235,183,0,0.2)",
              borderRadius: "8px",
              fontSize: "0.78rem",
              color: "var(--accent-primary)",
              fontWeight: 700,
            }}>
              ✓ Squad is full ({maxPlayers}/{maxPlayers})
            </div>
          )}
        </div>

        {/* Footer Save Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
            style={{ minWidth: "140px" }}
          >
            {loading ? "Saving..." : "Save Selection"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function AwardsClient({ users, initialTopTeam, initialBestEleven }: any) {
  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>
          Teams of the Season
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Curate and publish the Top Team and Best Eleven. Changes are immediately reflected on the public stats page.
        </p>
      </div>

      <AwardForm
        category="TOP_TEAM"
        title="Top Team — Best 11"
        icon="🏆"
        maxPlayers={11}
        initialData={initialTopTeam}
        users={users}
      />

      <AwardForm
        category="BEST_ELEVEN"
        title="Best Eleven of the Season"
        icon="⭐"
        maxPlayers={15}
        initialData={initialBestEleven}
        users={users}
      />
    </>
  );
}
