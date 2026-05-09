"use client";

import { useState } from "react";
import { upsertSeasonAward } from "@/lib/actions/stats.actions";
import { toast } from "react-hot-toast";
import CustomSelect from "@/app/components/panel/CustomSelect";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import PanToolIcon from '@mui/icons-material/PanTool';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useTransition, useEffect } from "react";
import { getSeasonAward } from "@/lib/actions/stats.actions";

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
function AwardForm({ category, tournamentId, title, icon, maxPlayers, initialData, users }: any) {
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [coachId, setCoachId] = useState<string>("");
  const [captainId, setCaptainId] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Update internal state when initialData changes (when tournament changes)
  useEffect(() => {
    if (initialData) {
      setPlayerIds(initialData.players?.map((p: any) => p.id) || []);
      setCoachId(initialData.coach?.id || "");
      setCaptainId(initialData.captain?.id || "");
      setDesc(initialData.description || "");
    } else {
      setPlayerIds([]);
      setCoachId("");
      setCaptainId("");
      setDesc("");
    }
  }, [initialData, tournamentId]);

  const filteredUsers = users.filter(
    (u: any) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) &&
      !playerIds.includes(u.id)
  );

  const handleSave = async () => {
    if (!tournamentId) {
      toast.error("Please select a tournament first.");
      return;
    }
    setLoading(true);
    const res = await upsertSeasonAward({
      category,
      tournamentId,
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
        opacity: tournamentId ? 1 : 0.5,
        pointerEvents: tournamentId ? "auto" : "none",
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

        {/* Coach & Captain - Only show for Team awards */}
        {category !== "TOP_SCORER" && category !== "BEST_GOALKEEPER" && category !== "BEST_PLAYER" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <CustomSelect
                label={<><span style={{ marginRight: '0.4rem' }}>👔</span> Coach</>}
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
                label={<><span style={{ marginRight: '0.4rem' }}>🏅</span> Captain</>}
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
        )}

        {/* Players Section */}
        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SportsSoccerIcon sx={{ fontSize: '0.9rem' }} /> Players ({filled} / {maxPlayers})
            </div>
          </FieldLabel>

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
import { submitAwardRating, getTopScorers, getBestGoalkeepers, getBestPlayers } from "@/lib/actions/stats.actions";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import GavelIcon from '@mui/icons-material/Gavel';

// ─── Hybrid Award Voting Component ──────────────────────────────────────────
function HybridAwardVoting({ tournamentId, category, title, icon, autoStats, judgeId }: any) {
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleRate = async (playerId: string) => {
    if (!ratings[playerId]) return;
    setLoading(true);
    const res = await submitAwardRating({
      tournamentId,
      category,
      playerId,
      rating: ratings[playerId],
      comment: comments[playerId]
    });
    setLoading(false);
    if (res.success) {
      toast.success("Rating submitted!");
    } else {
      toast.error(res.error || "Failed to submit rating");
    }
  };

  const getWeightLabel = () => {
    if (category === "TOP_SCORER") return "95% Auto / 5% Manual";
    if (category === "BEST_GOALKEEPER") return "70% Auto / 30% Manual";
    if (category === "BEST_PLAYER") return "60% Auto / 40% Manual";
    return "";
  };

  return (
    <div className="glass" style={{ borderRadius: "14px", padding: "1.5rem", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{getWeightLabel()}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {autoStats.slice(0, 5).map((s: any, idx: number) => (
          <div key={s.player.id} style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '10px', 
            padding: '1rem',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-muted)', width: '20px' }}>{idx + 1}</span>
              <img src={s.player.image || "/default-avatar.png"} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-color)' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.player.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.player.batch?.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <FieldLabel>Auto Score</FieldLabel>
                <div style={{ fontWeight: 800, color: 'var(--accent-secondary)' }}>{s.autoScore.toFixed(1)}</div>
              </div>
              <div>
                <FieldLabel>Final Score</FieldLabel>
                <div style={{ fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{s.finalScore.toFixed(1)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
              <div style={{ width: '100px' }}>
                <FieldLabel>Your Rating (1-10)</FieldLabel>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={ratings[s.player.id] || ""} 
                  onChange={(e) => setRatings(prev => ({ ...prev, [s.player.id]: parseInt(e.target.value) }))}
                  style={{ padding: '0.4rem', textAlign: 'center' }}
                />
              </div>
              <button 
                onClick={() => handleRate(s.player.id)}
                disabled={loading || !ratings[s.player.id]}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.8rem', height: '38px', borderRadius: '8px' }}
              >
                <GavelIcon sx={{ fontSize: '1.1rem' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function AwardsClient({ users, tournaments, currentUser }: any) {
  const [selectedTournamentId, setSelectedTournamentId] = useState(
    tournaments.find((t: any) => t.isActive)?.id || tournaments[0]?.id || ""
  );
  const [activeTab, setActiveTab] = useState<"CURATED" | "HYBRID">("HYBRID");
  const [topTeam, setTopTeam] = useState<any>(null);
  const [bestEleven, setBestEleven] = useState<any>(null);
  const [topScorer, setTopScorer] = useState<any>(null);
  const [bestGK, setBestGK] = useState<any>(null);
  const [bestPlayer, setBestPlayer] = useState<any>(null);
  
  const [autoTopScorers, setAutoTopScorers] = useState<any[]>([]);
  const [autoBestGKs, setAutoBestGKs] = useState<any[]>([]);
  const [autoBestPlayers, setAutoBestPlayers] = useState<any[]>([]);

  const [isPending, startTransition] = useTransition();

  const fetchData = (id: string) => {
    if (!id) return;
    startTransition(async () => {
      const [tt, be, ts, bgk, bp, autoTS, autoGK, autoBP] = await Promise.all([
        getSeasonAward("TOP_TEAM", id),
        getSeasonAward("BEST_ELEVEN", id),
        getSeasonAward("TOP_SCORER", id),
        getSeasonAward("BEST_GOALKEEPER", id),
        getSeasonAward("BEST_PLAYER", id),
        getTopScorers(id, 10),
        getBestGoalkeepers(id, 10),
        getBestPlayers(id, 10)
      ]);
      setTopTeam(tt);
      setBestEleven(be);
      setTopScorer(ts);
      setBestGK(bgk);
      setBestPlayer(bp);
      setAutoTopScorers(autoTS);
      setAutoBestGKs(autoGK);
      setAutoBestPlayers(autoBP);
    });
  };

  useEffect(() => {
    fetchData(selectedTournamentId);
  }, [selectedTournamentId]);

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>
            Awards & Recognition
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Manage hybrid scoring and curated team selections.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.25rem' }}>
            <button 
              onClick={() => setActiveTab("HYBRID")}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === "HYBRID" ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === "HYBRID" ? 'black' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Hybrid Scoring
            </button>
            <button 
              onClick={() => setActiveTab("CURATED")}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === "CURATED" ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === "CURATED" ? 'black' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Curated Awards
            </button>
          </div>

          <div style={{ minWidth: '240px' }}>
            <FieldLabel>Select Tournament</FieldLabel>
            <CustomSelect 
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
            >
              <option value="">— Select Tournament —</option>
              {tournaments.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}{t.isActive ? " (Active)" : ""}</option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {activeTab === "HYBRID" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <HybridAwardVoting 
              tournamentId={selectedTournamentId}
              category="BEST_PLAYER"
              title="Best Player — Player of the Tournament"
              icon={<MilitaryTechIcon sx={{ color: '#fbbf24' }} />}
              autoStats={autoBestPlayers}
              judgeId={currentUser?.id}
            />
            <HybridAwardVoting 
              tournamentId={selectedTournamentId}
              category="BEST_GOALKEEPER"
              title="Best Goalkeeper — Golden Glove"
              icon={<PanToolIcon sx={{ color: 'white' }} />}
              autoStats={autoBestGKs}
              judgeId={currentUser?.id}
            />
            <HybridAwardVoting 
              tournamentId={selectedTournamentId}
              category="TOP_SCORER"
              title="Top Scorer — Golden Boot"
              icon={<SportsSoccerIcon sx={{ color: '#fbbf24' }} />}
              autoStats={autoTopScorers}
              judgeId={currentUser?.id}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AwardForm
                key={`top-scorer-${selectedTournamentId}`}
                category="TOP_SCORER"
                tournamentId={selectedTournamentId}
                title="Top Scorer — Golden Boot"
                icon={<SportsSoccerIcon sx={{ color: '#fbbf24' }} />}
                maxPlayers={3}
                initialData={topScorer}
                users={users}
              />

              <AwardForm
                key={`best-gk-${selectedTournamentId}`}
                category="BEST_GOALKEEPER"
                tournamentId={selectedTournamentId}
                title="Best Goalkeeper — Golden Glove"
                icon={<PanToolIcon sx={{ color: 'white' }} />}
                maxPlayers={2}
                initialData={bestGK}
                users={users}
              />

              <AwardForm
                key={`best-player-${selectedTournamentId}`}
                category="BEST_PLAYER"
                tournamentId={selectedTournamentId}
                title="Best Player — Player of the Tournament"
                icon={<MilitaryTechIcon sx={{ color: '#fbbf24' }} />}
                maxPlayers={2}
                initialData={bestPlayer}
                users={users}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AwardForm
                key={`top-team-${selectedTournamentId}`}
                category="TOP_TEAM"
                tournamentId={selectedTournamentId}
                title="Top Team — Best 11"
                icon={<EmojiEventsIcon sx={{ color: '#fbbf24' }} />}
                maxPlayers={11}
                initialData={topTeam}
                users={users}
              />

              <AwardForm
                key={`best-eleven-${selectedTournamentId}`}
                category="BEST_ELEVEN"
                tournamentId={selectedTournamentId}
                title="Best Eleven of the Season"
                icon={<StarIcon sx={{ color: 'var(--accent-primary)' }} />}
                maxPlayers={15}
                initialData={bestEleven}
                users={users}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
