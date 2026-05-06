'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMatchScore, logMatchEvent, updateMatchClock, updateMatchStats, deleteMatchEvent, updateMatchEvent } from '@/lib/actions/match.actions';
import { toast } from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import SensorsIcon from '@mui/icons-material/Sensors';
import TimerIcon from '@mui/icons-material/Timer';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StyleIcon from '@mui/icons-material/Style'; // For Cards
import SyncIcon from '@mui/icons-material/Sync'; // For Subs
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  events?: any[];
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
  const [eventModal, setEventModal] = useState<{ matchId: string, type: string, eventId?: string, defaultData?: any } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Polling or local increment could go here
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

  async function handleAddOrUpdateEvent(matchId: string, type: string, data: any, eventId?: string) {
    startTransition(async () => {
      let res;
      if (eventId) {
        res = await updateMatchEvent(eventId, data);
      } else {
        const match = matches.find(m => m.id === matchId);
        res = await logMatchEvent(matchId, {
          type,
          minute: match?.currentMinute || 0,
          ...data
        });
      }
      if (res.success) {
        toast.success(eventId ? 'Event updated' : `${type} logged!`);
        setEventModal(null);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm('Are you sure you want to delete this event? This will revert the score if it was a goal.')) return;
    startTransition(async () => {
      const res = await deleteMatchEvent(eventId);
      if (res.success) {
        toast.success('Event deleted');
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
              <div style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.5rem' }}>
                <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'white' }}>{match.homeTeam.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <button onClick={() => updateLocal(match.id, 'homeScore', Math.max(0, match.homeScore - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '900', cursor: 'pointer' }}>-</button>
                  <input type="number" value={match.homeScore} onChange={(e) => updateLocal(match.id, 'homeScore', parseInt(e.target.value) || 0)} className="score-input" style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '1.8rem', fontWeight: '950', background: 'transparent', border: 'none', color: 'var(--accent-primary)', outline: 'none' }} />
                  <button onClick={() => updateLocal(match.id, 'homeScore', match.homeScore + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontWeight: '900', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--text-muted)', opacity: 0.5 }}>VS</div>
              <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <button onClick={() => updateLocal(match.id, 'awayScore', Math.max(0, match.awayScore - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '900', cursor: 'pointer' }}>-</button>
                  <input type="number" value={match.awayScore} onChange={(e) => updateLocal(match.id, 'awayScore', parseInt(e.target.value) || 0)} className="score-input" style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '1.8rem', fontWeight: '950', background: 'transparent', border: 'none', color: 'var(--accent-primary)', outline: 'none' }} />
                  <button onClick={() => updateLocal(match.id, 'awayScore', match.awayScore + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontWeight: '900', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'white' }}>{match.awayTeam.name}</div>
              </div>
            </div>

            {/* Event Console (Expandable) */}
            {activeConsole === match.id && (
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}><TimerIcon fontSize="small" /> MATCH CLOCK</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="number" value={match.currentMinute} onChange={(e) => updateLocal(match.id, 'currentMinute', parseInt(e.target.value) || 0)} style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center', borderRadius: '4px' }} />
                      <button onClick={() => handleClockToggle(match)} className={`btn ${match.clockRunning ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }}>{match.clockRunning ? 'Stop Clock' : 'Start Clock'}</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>QUICK LOG</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'GOAL' })} className="btn glass" style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}><SportsSoccerIcon fontSize="small" sx={{ mr: 0.5 }} /> Goal</button>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'YELLOW_CARD' })} className="btn glass" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}><StyleIcon fontSize="small" sx={{ mr: 0.5 }} /> Yellow</button>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'RED_CARD' })} className="btn glass" style={{ color: '#ef4444', borderColor: '#ef4444' }}><StyleIcon fontSize="small" sx={{ mr: 0.5 }} /> Red</button>
                      <button onClick={() => setEventModal({ matchId: match.id, type: 'SUBSTITUTION' })} className="btn glass" style={{ color: '#10b981', borderColor: '#10b981' }}><SyncIcon fontSize="small" sx={{ mr: 0.5 }} /> Sub</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}><BarChartIcon fontSize="small" /> LIVE STATS</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                      <div><input type="number" value={match.homeShots} onChange={(e) => updateLocal(match.id, 'homeShots', parseInt(e.target.value))} style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontWeight: '900', textAlign: 'center' }} /></div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL SHOTS</div>
                      <div><input type="number" value={match.awayShots} onChange={(e) => updateLocal(match.id, 'awayShots', parseInt(e.target.value))} style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontWeight: '900', textAlign: 'center' }} /></div>
                   </div>
                   <div style={{ textAlign: 'center', marginTop: '1rem' }}><button onClick={() => startTransition(async () => { const res = await updateMatchStats(match.id, match); if (res.success) toast.success('Stats updated'); })} className="btn glass" style={{ fontSize: '0.7rem' }}>Save Stats</button></div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                   <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}>RECENT EVENTS</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {match.events?.length === 0 ? (<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No events logged yet.</div>) : (
                        match.events?.map((event: any) => (
                          <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                             <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                                <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>{event.minute}'</span>
                                {event.type} — {event.player?.name} ({event.team?.name})
                             </div>
                             <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setEventModal({ matchId: match.id, type: event.type, eventId: event.id, defaultData: event })} className="btn glass" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}><EditIcon sx={{ fontSize: '0.8rem', mr: 0.2 }} /> Edit</button>
                                <button onClick={() => handleDeleteEvent(event.id)} className="btn glass" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center' }}><DeleteIcon sx={{ fontSize: '0.8rem', mr: 0.2 }} /> Delete</button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select value={match.status} onChange={(e) => updateLocal(match.id, 'status', e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: '700' }}><option value="SCHEDULED">Scheduled</option><option value="LIVE">Live 🔴</option><option value="FINISHED">Finished ✅</option><option value="CANCELLED">Cancelled</option></select>
              <button onClick={() => handleSaveScore(match)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><SaveIcon fontSize="small" /> Save Match Status</button>
            </div>
          </div>
        ))
      )}

      {/* Event Modal */}
      {eventModal && (
        <EventModal 
          isOpen={!!eventModal} 
          onClose={() => setEventModal(null)} 
          onSubmit={(data: any) => handleAddOrUpdateEvent(eventModal.matchId, eventModal.type, data, eventModal.eventId)}
          type={eventModal.type}
          match={matches.find(m => m.id === eventModal.matchId)!}
          defaultData={eventModal.defaultData}
        />
      )}
      
      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .score-input::-webkit-outer-spin-button, .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .score-input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}

function EventModal({ isOpen, onClose, onSubmit, type, match, defaultData }: any) {
  const [teamId, setTeamId] = useState(defaultData?.teamId || match.homeTeam.id);
  const [playerId, setPlayerId] = useState(defaultData?.playerId || '');
  const [minute, setMinute] = useState(defaultData?.minute || match.currentMinute);
  const [note, setNote] = useState(defaultData?.note || '');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', fontWeight: '900' }}>{defaultData ? 'EDIT' : 'LOG'} {type}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>MINUTE</label>
            <input type="number" value={minute} onChange={(e) => setMinute(parseInt(e.target.value))} className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TEAM</label>
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
              <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
              <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PLAYER</label>
            <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.05)' }}>
              <option value="">Select Player</option>
              {match.matchSquads.filter((s: any) => s.batchId === teamId).map((s: any) => (
                <option key={s.user.id} value={s.user.id}>{s.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>NOTE (OPTIONAL)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="glass" style={{ width: '100%', padding: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.05)' }} placeholder="e.g. Penalty, Own Goal" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onClose} className="btn glass" style={{ flex: 1 }}>Cancel</button>
            <button onClick={() => onSubmit({ teamId, playerId, minute, note })} className="btn btn-primary" style={{ flex: 1 }}>{defaultData ? 'Update' : 'Log Event'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
