"use client";

import { useState } from "react";
import { upsertSeasonAward } from "@/lib/actions/stats.actions";
import { useRouter } from "next/navigation";

function AwardForm({ category, title, maxPlayers, initialData, users }: any) {
  const [playerIds, setPlayerIds] = useState<string[]>(initialData?.players.map((p:any) => p.id) || []);
  const [coachId, setCoachId] = useState<string>(initialData?.coach?.id || "");
  const [captainId, setCaptainId] = useState<string>(initialData?.captain?.id || "");
  const [desc, setDesc] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u:any) => u.name?.toLowerCase().includes(search.toLowerCase()) && !playerIds.includes(u.id));

  const handleSave = async () => {
    setLoading(true);
    await upsertSeasonAward({
      category,
      title,
      description: desc,
      playerIds,
      coachId: coachId || undefined,
      captainId: captainId || undefined
    });
    setLoading(false);
    alert("Saved successfully!");
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Description / Note</label>
        <textarea 
          value={desc} 
          onChange={e => setDesc(e.target.value)}
          className="input" 
          rows={2} 
          placeholder="Optional description" 
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Coach</label>
          <select value={coachId} onChange={e => setCoachId(e.target.value)} className="input">
            <option value="">None</option>
            {users.map((u:any) => <option key={u.id} value={u.id}>{u.name} ({u.batch?.name})</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Captain</label>
          <select value={captainId} onChange={e => setCaptainId(e.target.value)} className="input">
            <option value="">None</option>
            {playerIds.map(id => {
              const u = users.find((u:any) => u.id === id);
              return u ? <option key={u.id} value={u.id}>{u.name} ({u.batch?.name})</option> : null;
            })}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          Players ({playerIds.length} / {maxPlayers})
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {playerIds.map(id => {
            const u = users.find((u:any) => u.id === id);
            if (!u) return null;
            return (
              <div key={id} style={{ background: 'var(--accent-primary)', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {u.name} ({u.batch?.name || 'No Batch'})
                <button onClick={() => setPlayerIds(prev => prev.filter(p => p !== id))} style={{ background: 'transparent', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </div>
            );
          })}
        </div>

        {playerIds.length < maxPlayers && (
          <div>
            <input 
              type="text" 
              placeholder="Search players to add..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="input" 
              style={{ marginBottom: '0.5rem' }} 
            />
            {search && (
              <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem' }}>
                {filteredUsers.slice(0, 10).map((u:any) => (
                  <div key={u.id} style={{ padding: '0.3rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }} onClick={() => { setPlayerIds(prev => [...prev, u.id]); setSearch(""); }}>
                    + {u.name} <span style={{ color: 'var(--text-muted)' }}>({u.batch?.name})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={loading} className="btn btn-primary">
        {loading ? "Saving..." : "Save Selection"}
      </button>
    </div>
  );
}

export default function AwardsClient({ users, initialTopTeam, initialBestEleven }: any) {
  const router = useRouter();

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Manage Teams of the Season</h1>
      
      <AwardForm 
        category="TOP_TEAM" 
        title="Top Team (Best 11)" 
        maxPlayers={11} 
        initialData={initialTopTeam} 
        users={users} 
      />

      <AwardForm 
        category="BEST_ELEVEN" 
        title="Best Eleven of the Season (15 Players)" 
        maxPlayers={15} 
        initialData={initialBestEleven} 
        users={users} 
      />
    </div>
  );
}
