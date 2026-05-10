"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveBracketConfig } from "@/lib/actions/tournament.actions";

type BracketMatch = { id: string; home: string; away: string };
type BracketStage = { stage: string; matches: BracketMatch[] };

const STAGES = ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL", "THIRD_PLACE"];

export default function BracketClient({ tournament }: { tournament: any }) {
  const initialStages = Array.isArray(tournament.bracketConfig) ? tournament.bracketConfig : [];
  const [bracketStages, setBracketStages] = useState<BracketStage[]>(initialStages);
  const [isEditing, setIsEditing] = useState(initialStages.length === 0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

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

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      const res = await saveBracketConfig(tournament.id, bracketStages);
      if (res.success) {
        setIsEditing(false);
      } else {
        setError(res.error || "Failed to save bracket configuration.");
      }
    });
  };

  const resolveLabel = (val: string) => {
    if (!val) return "TBD";
    if (val.startsWith("GROUP_")) {
      const parts = val.split("_");
      const groupId = parts[1];
      const rank = parts[2];
      const group = tournament.groups?.find((g: any) => g.id === groupId);
      return `${group ? group.name : "Group"} - Rank ${rank}`;
    }
    if (val.startsWith("WINNER_")) {
      return `Winner of ${val.split("_")[1]}`;
    }
    if (val.startsWith("LOSER_")) {
      return `Loser of ${val.split("_")[1]}`;
    }
    return val;
  };

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Link href={`/admin/tournaments/${tournament.id}`} style={{ color: "var(--accent-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: "700" }}>
            &larr; Back to Tournament
          </Link>
          <h1 style={{ marginTop: "1rem", fontSize: "2rem", fontWeight: "900" }}>{tournament.name} - Bracket Setup</h1>
          <p style={{ color: "var(--text-muted)" }}>Pre-declared matchups for the knockout stages.</p>
        </div>
        <div>
          {isEditing ? (
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-secondary" onClick={() => { setIsEditing(false); setBracketStages(initialStages); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save Bracket"}</button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Bracket</button>
          )}
        </div>
      </div>

      {error && <div style={{ color: "var(--accent-danger)", marginBottom: "1rem" }}>{error}</div>}

      {!isEditing ? (
        bracketStages.length === 0 ? (
          <div className="glass" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No bracket configured for this tournament. Click "Edit Bracket" to set one up.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {bracketStages.map((stage: any, sIdx: number) => (
              <div key={sIdx} className="glass" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "1.5rem", textTransform: "uppercase" }}>
                  {stage.stage.replace(/_/g, " ")}
                </h2>
                <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                  {stage.matches.map((m: any) => (
                    <div key={m.id} style={{ background: "rgba(0,0,0,0.4)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "var(--accent-primary)", marginBottom: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8 }}>Match ID: {m.id}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
                        <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{resolveLabel(m.home)}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "900", margin: "0.25rem 0" }}>VS</div>
                        <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{resolveLabel(m.away)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="glass" style={{ padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, fontWeight: "800" }}>Bracket Editor</h3>
            <button type="button" onClick={addStage} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
              + Add Stage
            </button>
          </div>
          
          {bracketStages.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No stages added. Click "+ Add Stage" to begin.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {bracketStages.map((stage, sIdx) => (
                <div key={sIdx} style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "8px", position: "relative" }}>
                  <button type="button" onClick={() => removeStage(sIdx)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "var(--accent-danger)", cursor: "pointer", fontSize: "1.5rem" }}>&times;</button>
                  <div style={{ marginBottom: "1rem" }}>
                    <select 
                      value={stage.stage} 
                      onChange={(e) => updateStageName(sIdx, e.target.value)}
                      style={{ padding: "0.5rem 1rem", background: "var(--bg-secondary)", color: "white", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "1rem", fontWeight: "700" }}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {stage.matches.map((m, mIdx) => {
                      const options = [{ value: "", label: "-- Select Team --" }];
                      if (tournament.groups) {
                        tournament.groups.forEach((g: any) => {
                          for (let i = 1; i <= 4; i++) {
                            options.push({ value: `GROUP_${g.id}_${i}`, label: `${g.name} - Rank ${i}` });
                          }
                        });
                      }
                      for (let i = 0; i < sIdx; i++) {
                        bracketStages[i].matches.forEach(prevM => {
                          if (prevM.id) {
                            options.push({ value: `WINNER_${prevM.id}`, label: `Winner of ${prevM.id}` });
                            options.push({ value: `LOSER_${prevM.id}`, label: `Loser of ${prevM.id}` });
                          }
                        });
                      }

                      return (
                        <div key={m.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1fr auto", gap: "1rem", alignItems: "center", fontSize: "0.9rem" }}>
                          <span style={{ fontWeight: "700", color: "var(--accent-primary)" }}>{m.id}</span>
                          
                          <select 
                            value={m.home} 
                            onChange={e => updateMatch(sIdx, mIdx, "home", e.target.value)} 
                            style={{ padding: "0.5rem", background: "rgba(0,0,0,0.3)", color: "white", border: "1px solid var(--border-color)", borderRadius: "4px", width: "100%" }}
                          >
                            {options.map(opt => <option key={`home-${opt.value}`} value={opt.value}>{opt.label}</option>)}
                          </select>

                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "800" }}>VS</span>
                          
                          <select 
                            value={m.away} 
                            onChange={e => updateMatch(sIdx, mIdx, "away", e.target.value)} 
                            style={{ padding: "0.5rem", background: "rgba(0,0,0,0.3)", color: "white", border: "1px solid var(--border-color)", borderRadius: "4px", width: "100%" }}
                          >
                            {options.map(opt => <option key={`away-${opt.value}`} value={opt.value}>{opt.label}</option>)}
                          </select>

                          <button type="button" onClick={() => removeMatch(sIdx, mIdx)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button type="button" onClick={() => addMatch(sIdx)} style={{ marginTop: "1rem", background: "transparent", border: "1px dashed var(--border-color)", color: "var(--text-muted)", padding: "0.6rem", borderRadius: "4px", width: "100%", cursor: "pointer", fontSize: "0.9rem", fontWeight: "600" }}>
                    + Add Match
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
