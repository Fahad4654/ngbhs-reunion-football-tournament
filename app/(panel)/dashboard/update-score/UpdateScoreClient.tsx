'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMatchScore } from '@/lib/actions/match.actions';
import { toast } from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import SensorsIcon from '@mui/icons-material/Sensors';

type Match = {
  id: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  homeScore: number;
  awayScore: number;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  tournament: { name: string } | null;
  date: string;
};

export default function UpdateScoreClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateLocal(id: string, field: string, value: any) {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  async function handleSave(match: Match) {
    startTransition(async () => {
      const res = await updateMatchScore(match.id, {
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore
      });

      if (res.success) {
        toast.success(`Score updated for ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update score');
      }
    });
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {matches.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>No active or upcoming matches found to update.</p>
        </div>
      ) : (
        matches.map((match) => (
          <div key={match.id} className="glass" style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            border: match.status === 'LIVE' ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
            background: match.status === 'LIVE' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)'
          }}>
            {/* Match Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {match.status === 'LIVE' && <SensorsIcon sx={{ color: 'var(--accent-danger)', fontSize: '1rem', animation: 'pulse 2s infinite' }} />}
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {match.tournament?.name || 'Friendly Match'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {new Date(match.date).toLocaleString()}
              </div>
            </div>

            {/* Score Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
              {/* Home Team */}
              <div style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{match.homeTeam.name}</div>
                <input 
                  type="number" 
                  value={match.homeScore} 
                  onChange={(e) => updateLocal(match.id, 'homeScore', parseInt(e.target.value) || 0)}
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    fontWeight: '900',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </div>

              <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-muted)' }}>VS</div>

              {/* Away Team */}
              <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem' }}>
                <input 
                  type="number" 
                  value={match.awayScore} 
                  onChange={(e) => updateLocal(match.id, 'awayScore', parseInt(e.target.value) || 0)}
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    fontWeight: '900',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{match.awayTeam.name}</div>
              </div>
            </div>

            {/* Status & Save */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS:</label>
                <select 
                  value={match.status} 
                  onChange={(e) => updateLocal(match.id, 'status', e.target.value)}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid var(--border-color)', 
                    color: 'white', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '6px',
                    fontWeight: '700'
                  }}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="LIVE">Live 🔴</option>
                  <option value="FINISHED">Finished ✅</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button 
                onClick={() => handleSave(match)}
                disabled={isPending}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}
              >
                <SaveIcon sx={{ fontSize: '1.2rem' }} />
                {isPending ? 'Saving...' : 'Update Result'}
              </button>
            </div>
          </div>
        ))
      )}
      
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
