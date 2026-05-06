'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMatchScore, logMatchEvent, updateMatchClock, updateMatchStats } from '@/lib/actions/match.actions';
import { toast } from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import SensorsIcon from '@mui/icons-material/Sensors';
import TimerIcon from '@mui/icons-material/Timer';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StyleIcon from '@mui/icons-material/Style'; // For Cards
import SyncIcon from '@mui/icons-material/Sync'; // For Subs
import BarChartIcon from '@mui/icons-material/BarChart';

type Player = { id: string, name: string | null };

type Match = {
  id: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; logoUrl: string | null };
  awayTeam: { id: string; name: string; logoUrl: string | null };
  tournament: { name: string } | null;
  date: string;
  currentMinute: number;
  clockRunning: boolean;
  injuryTime: number;
  matchSquads: { batchId: string, user: Player }[];
  // Stats
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeOffsides: number;
  awayOffsides: number;
};

export default function UpdateScoreClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [isPending, startTransition] = useTransition();
  const [activeConsole, setActiveConsole] = useState<string | null>(null);
  const [eventModal, setEventModal] = useState<{ matchId: string, type: string } | null>(null);
  const router = useRouter();

  // Local clock state for UI feedback
  const [clocks, setClocks] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => {
        if (m.clockRunning && m.status === 'LIVE') {
          // Increment locally every minute
          // In a real app, we'd use seconds, but here we'll just show the minute
        }
        return m;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function updateLocal(id: string, field: string, value: any) {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  async function handleSaveScore(match: Match) {
    startTransition(async () => {
      const res = await updateMatchScore(match.id, {
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore
      });
      if (res.success) {
        toast.success(`Score updated`);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  async function handleClockToggle(match: Match) {
    startTransition(async () => {
      const res = await updateMatchClock(match.id, {
        running: !match.clockRunning,
        minute: match.currentMinute,
        injuryTime: match.injuryTime
      });
      if (res.success) {
        updateLocal(match.id, 'clockRunning', !match.clockRunning);
        toast.success(match.clockRunning ? 'Clock stopped' : 'Clock started');
      } else toast.error(res.error);
    });
  }

  async function handleAddEvent(matchId: string, type: string, data: any) {
    startTransition(async () => {
      const match = matches.find(m => m.id === matchId);
      const res = await logMatchEvent(matchId, {
        type,
        minute: match?.currentMinute || 0,
        ...data
      });
      if (res.success) {
        toast.success(`${type} logged!`);
        setEventModal(null);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {matches.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>No active matches found.</p>
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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {match.status === 'LIVE' && <SensorsIcon sx={{ color: 'var(--accent-danger)', fontSize: '1.2rem', animation: 'pulse 2s infinite' }} />}
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {match.tournament?.name || 'Match'} — {match.status}
                </span>
                {match.status === 'LIVE' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '900', fontSize: '0.9rem' }}>
                    {match.currentMinute}'{match.injuryTime > 0 ? ` +${match.injuryTime}` : ''}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActiveConsole(activeConsole === match.id ? null : match.id)}
                className="btn glass"
                style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
              >
                {activeConsole === match.id ? 'Close Console' : 'Open Event Console'}
              </button>
            </div>

            {/* Score & Main Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
              <div style={{ flex: 1, textAlign: 'right', fontWeight: '900', fontSize: '1.2rem' }}>{match.homeTeam.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={match.homeScore} 
                  onChange={(e) => updateLocal(match.id, 'homeScore', parseInt(e.target.value) || 0)}
                  style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
                />
                <span style={{ color: 'var(--text-muted)', fontWeight: '900' }}>-</span>
                <input 
                  type="number" 
                  value={match.awayScore} 
                  onChange={(e) => updateLocal(match.id, 'awayScore', parseInt(e.target.value) || 0)}
                  style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1, textAlign: 'left', fontWeight: '900', fontSize: '1.2rem' }}>{match.awayTeam.name}</div>
            </div>

            {/* Event Console (Expandable) */}
            {activeConsole === match.id && (
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Clock Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      <TimerIcon fontSize="small" /> MATCH CLOCK
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        value={match.currentMinute} 
                        onChange={(e) => updateLocal(match.id, 'currentMinute', parseInt(e.target.value) || 0)}
                        style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center', borderRadius: '4px' }}
                      />
                      <button onClick={() => handleClockToggle(match)} className={`btn ${match.clockRunning ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }}>
                        {match.clockRunning ? 'Stop Clock' : 'Start Clock'}
                      </button>
                    </div>
                  </div>

                  {/* Event Quick Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>QUICK LOG</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'GOAL' })} className="btn glass" style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
                        <SportsSoccerIcon fontSize="small" sx={{ mr: 0.5 }} /> Goal
                      </button>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'YELLOW_CARD' })} className="btn glass" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
                        <StyleIcon fontSize="small" sx={{ mr: 0.5 }} /> Yellow
                      </button>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'RED_CARD' })} className="btn glass" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                        <StyleIcon fontSize="small" sx={{ mr: 0.5 }} /> Red
                      </button>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'SUBSTITUTION' })} className="btn glass" style={{ color: '#10b981', borderColor: '#10b981' }}>
                        <SyncIcon fontSize="small" sx={{ mr: 0.5 }} /> Sub
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <BarChartIcon fontSize="small" /> LIVE STATS
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                      <div>
                        <input type="number" value={match.homeShots} onChange={(e) => updateLocal(match.id, 'homeShots', parseInt(e.target.value))} style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontWeight: '900', textAlign: 'center' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL SHOTS</div>
                      <div>
                        <input type="number" value={match.awayShots} onChange={(e) => updateLocal(match.id, 'awayShots', parseInt(e.target.value))} style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontWeight: '900', textAlign: 'center' }} />
                      </div>
                   </div>
                   <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button onClick={() => startTransition(async () => {
                         const res = await updateMatchStats(match.id, match);
                         if (res.success) toast.success('Stats updated');
                      })} className="btn glass" style={{ fontSize: '0.7rem' }}>Save Stats</button>
                   </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select 
                value={match.status} 
                onChange={(e) => updateLocal(match.id, 'status', e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: '700' }}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live 🔴</option>
                <option value="FINISHED">Finished ✅</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button onClick={() => handleSaveScore(match)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SaveIcon fontSize="small" /> Save Match Status
              </button>
            </div>
          </div>
        ))
      )}

      {/* Event Modal */}
      {eventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontWeight: '900' }}>LOG {eventModal.type}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TEAM</label>
                <select id="event-team" className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
                  <option value={matches.find(m => m.id === eventModal.matchId)?.homeTeam.id}>{matches.find(m => m.id === eventModal.matchId)?.homeTeam.name}</option>
                  <option value={matches.find(m => m.id === eventModal.matchId)?.awayTeam.id}>{matches.find(m => m.id === eventModal.matchId)?.awayTeam.name}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PLAYER</label>
                <select id="event-player" className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
                  <option value="">Select Player</option>
                  {matches.find(m => m.id === eventModal.matchId)?.matchSquads.map(s => (
                    <option key={s.user.id} value={s.user.id}>{s.user.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setEventModal(null)} className="btn glass" style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => {
                  const teamId = (document.getElementById('event-team') as HTMLSelectElement).value;
                  const playerId = (document.getElementById('event-player') as HTMLSelectElement).value;
                  handleAddEvent(eventModal.matchId, eventModal.type, { teamId, playerId });
                }} className="btn btn-primary" style={{ flex: 1 }}>Log Event</button>
              </div>
            </div>
          </div>
        </div>
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
