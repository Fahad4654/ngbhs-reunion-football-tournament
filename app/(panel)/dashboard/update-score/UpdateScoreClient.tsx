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
import FlagIcon from '@mui/icons-material/Flag';

type Player = { id: string, name: string | null };

type Match = {
  id: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  matchPeriod: string;
  homeScore: number;
  awayScore: number;
  homePenaltyScore: number;
  awayPenaltyScore: number;
  homeTeam: { id: string; name: string; logoUrl: string | null };
  awayTeam: { id: string; name: string; logoUrl: string | null };
  tournament: { name: string } | null;
  date: string;
  currentMinute: number;
  clockRunning: boolean;
  injuryTime: number;
  clockStartedAt?: string | Date | null;
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

const PERIODS = [
  { value: 'PRE_MATCH', label: 'Pre-Match' },
  { value: 'FIRST_HALF', label: '1st Half' },
  { value: 'HALF_TIME', label: 'Half Time' },
  { value: 'SECOND_HALF', label: '2nd Half' },
  { value: 'FULL_TIME', label: 'Full Time (90\')' },
  { value: 'EXTRA_TIME_1', label: 'Extra Time 1' },
  { value: 'EXTRA_TIME_HALF_TIME', label: 'ET Half Time' },
  { value: 'EXTRA_TIME_2', label: 'Extra Time 2' },
  { value: 'PENALTIES', label: 'Penalties' },
  { value: 'FINISHED', label: 'Finished' },
];

export default function UpdateScoreClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [isPending, startTransition] = useTransition();
  const [activeConsole, setActiveConsole] = useState<string | null>(null);
  const [eventModal, setEventModal] = useState<{ matchId: string, type: string, eventId?: string, defaultData?: any } | null>(null);
  const [tick, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  function updateLocal(id: string, field: string, value: any) {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  function getDisplayMinute(match: Match) {
    if (match.status === 'LIVE' && match.clockRunning && match.clockStartedAt) {
      const elapsedMs = new Date().getTime() - new Date(match.clockStartedAt).getTime();
      return match.currentMinute + Math.floor(elapsedMs / 60000);
    }
    return match.currentMinute;
  }

  async function handleSaveScore(match: Match) {
    startTransition(async () => {
      const res = await updateMatchScore(match.id, {
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        homePenaltyScore: match.homePenaltyScore,
        awayPenaltyScore: match.awayPenaltyScore,
        matchPeriod: match.matchPeriod
      });
      if (res.success) {
        toast.success(`Match state updated`);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  async function handleClockToggle(match: Match) {
    const displayMin = getDisplayMinute(match);
    startTransition(async () => {
      const res = await updateMatchClock(match.id, {
        running: !match.clockRunning,
        minute: displayMin,
        injuryTime: match.injuryTime,
        matchPeriod: match.matchPeriod
      });
      if (res.success) {
        toast.success(match.clockRunning ? 'Clock paused' : 'Clock started');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  async function handleAddOrUpdateEvent(matchId: string, type: string, data: any, eventId?: string) {
    if (!eventId && type === 'GOAL') {
       const match = matches.find(m => m.id === matchId);
       if (match) {
         const isHome = match.homeTeam.id === data.teamId;
         updateLocal(matchId, isHome ? 'homeScore' : 'awayScore', (isHome ? match.homeScore : match.awayScore) + 1);
       }
    }

    startTransition(async () => {
      let res;
      if (eventId) {
        res = await updateMatchEvent(eventId, data);
      } else {
        const match = matches.find(m => m.id === matchId);
        res = await logMatchEvent(matchId, {
          type,
          minute: data.minute || getDisplayMinute(match!),
          ...data
        });
      }
      if (res.success) {
        toast.success(eventId ? 'Event updated' : `${type} logged!`);
        setEventModal(null);
        router.refresh();
      } else {
        if (!eventId && type === 'GOAL') router.refresh();
        toast.error(res.error);
      }
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
        matches.map((match) => {
          const displayMinute = getDisplayMinute(match);
          return (
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
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem' }}>
                    {PERIODS.find(p => p.value === match.matchPeriod)?.label || match.matchPeriod}
                  </div>
                  {match.status === 'LIVE' && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '900', fontSize: '0.9rem' }}>
                      {displayMinute}'{match.injuryTime > 0 ? ` +${match.injuryTime}` : ''}
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
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '80px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: '950', color: 'var(--accent-primary)' }}>{match.homeScore}</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--text-muted)', opacity: 0.5 }}>VS</div>
                <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '80px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: '950', color: 'var(--accent-primary)' }}>{match.awayScore}</span>
                  </div>
                  <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'white' }}>{match.awayTeam.name}</div>
                </div>
              </div>

              {/* Penalty Score (Conditional) */}
              {match.matchPeriod === 'PENALTIES' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>PENALTIES:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateLocal(match.id, 'homePenaltyScore', Math.max(0, match.homePenaltyScore - 1))} className="btn glass" style={{ padding: '0.2rem 0.5rem' }}>-</button>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{match.homePenaltyScore}</span>
                    <button onClick={() => updateLocal(match.id, 'homePenaltyScore', match.homePenaltyScore + 1)} className="btn glass" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                  </div>
                  <div style={{ fontWeight: '900' }}>-</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateLocal(match.id, 'awayPenaltyScore', Math.max(0, match.awayPenaltyScore - 1))} className="btn glass" style={{ padding: '0.2rem 0.5rem' }}>-</button>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{match.awayPenaltyScore}</span>
                    <button onClick={() => updateLocal(match.id, 'awayPenaltyScore', match.awayPenaltyScore + 1)} className="btn glass" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                  </div>
                </div>
              )}

              {/* Event Console (Expandable) */}
              {activeConsole === match.id && (
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    {/* Left: Clock & Period */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><TimerIcon fontSize="small" /> MATCH CLOCK</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <button onClick={() => updateLocal(match.id, 'currentMinute', Math.max(0, match.currentMinute - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
                                <input type="number" value={displayMinute} onChange={(e) => updateLocal(match.id, 'currentMinute', parseInt(e.target.value) || 0)} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
                                <button onClick={() => updateLocal(match.id, 'currentMinute', match.currentMinute + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
                              </div>
                              <button onClick={() => handleClockToggle(match)} className={`btn ${match.clockRunning ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }}>{match.clockRunning ? 'Pause Clock' : 'Start Clock'}</button>
                            </div>
                         </div>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><FlagIcon fontSize="small" /> MATCH PERIOD</div>
                            <select value={match.matchPeriod} onChange={(e) => updateLocal(match.id, 'matchPeriod', e.target.value)} className="glass" style={{ width: '100%', padding: '0.4rem', color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                         </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>INJURY TIME (ADDITIONAL MINS)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
                          <button onClick={() => updateLocal(match.id, 'injuryTime', Math.max(0, match.injuryTime - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
                          <input type="number" value={match.injuryTime} onChange={(e) => updateLocal(match.id, 'injuryTime', parseInt(e.target.value) || 0)} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
                          <button onClick={() => updateLocal(match.id, 'injuryTime', match.injuryTime + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Actions */}
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

                  {/* Stats Section */}
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}><BarChartIcon fontSize="small" /> LIVE STATS</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <button onClick={() => { const v = Math.max(0, match.homePossession - 1); updateLocal(match.id, 'homePossession', v); updateLocal(match.id, 'awayPossession', 100 - v); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
                              <input type="number" value={match.homePossession} onChange={(e) => { const v = parseInt(e.target.value) || 0; updateLocal(match.id, 'homePossession', v); updateLocal(match.id, 'awayPossession', 100 - v); }} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
                              <span>%</span>
                              <button onClick={() => { const v = Math.min(100, match.homePossession + 1); updateLocal(match.id, 'homePossession', v); updateLocal(match.id, 'awayPossession', 100 - v); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>POSSESSION</div>
                          <div style={{ fontWeight: '900', color: 'var(--accent-primary)' }}>{match.awayPossession}%</div>
                        </div>
                        <StatUpdateRow label="TOTAL SHOTS" homeKey="homeShots" awayKey="awayShots" match={match} updateLocal={updateLocal} />
                        <StatUpdateRow label="SHOTS ON TARGET" homeKey="homeShotsOnTarget" awayKey="awayShotsOnTarget" match={match} updateLocal={updateLocal} />
                        <StatUpdateRow label="CORNERS" homeKey="homeCorners" awayKey="awayCorners" match={match} updateLocal={updateLocal} />
                        <StatUpdateRow label="OFFSIDES" homeKey="homeOffsides" awayKey="awayOffsides" match={match} updateLocal={updateLocal} />
                     </div>
                     <div style={{ textAlign: 'center', marginTop: '2rem' }}><button onClick={() => startTransition(async () => { const res = await updateMatchStats(match.id, match); if (res.success) toast.success('All stats updated'); })} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.6rem 2rem' }}>Save All Stats</button></div>
                  </div>

                  {/* Event History Section */}
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

              {/* Status Update */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select value={match.status} onChange={(e) => updateLocal(match.id, 'status', e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: '700' }}><option value="SCHEDULED">Scheduled</option><option value="LIVE">Live 🔴</option><option value="FINISHED">Finished ✅</option><option value="CANCELLED">Cancelled</option></select>
                <button onClick={() => handleSaveScore(match)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><SaveIcon fontSize="small" /> Save Match State</button>
              </div>
            </div>
          );
        })
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
          displayMinute={getDisplayMinute(matches.find(m => m.id === eventModal.matchId)!)}
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

function StatUpdateRow({ label, homeKey, awayKey, match, updateLocal }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => updateLocal(match.id, homeKey, Math.max(0, match[homeKey] - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
          <input type="number" value={match[homeKey]} onChange={(e) => updateLocal(match.id, homeKey, parseInt(e.target.value) || 0)} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
          <button onClick={() => updateLocal(match.id, homeKey, match[homeKey] + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => updateLocal(match.id, awayKey, Math.max(0, match[awayKey] - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
          <input type="number" value={match[awayKey]} onChange={(e) => updateLocal(match.id, awayKey, parseInt(e.target.value) || 0)} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
          <button onClick={() => updateLocal(match.id, awayKey, match[awayKey] + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
        </div>
      </div>
    </div>
  );
}

function EventModal({ isOpen, onClose, onSubmit, type, match, defaultData, displayMinute }: any) {
  const [teamId, setTeamId] = useState(defaultData?.teamId || match.homeTeam.id);
  const [playerId, setPlayerId] = useState(defaultData?.playerId || '');
  const [minute, setMinute] = useState(defaultData?.minute || displayMinute);
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
