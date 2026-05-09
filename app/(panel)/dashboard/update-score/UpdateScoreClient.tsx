'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMatchScore, logMatchEvent, updateMatchClock, updateMatchStats, deleteMatchEvent, updateMatchEvent } from '@/lib/actions/match.actions';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/app/components/ConfirmModal';
import CustomSelect from '@/app/components/panel/CustomSelect';
import SensorsIcon from '@mui/icons-material/Sensors';
import TimerIcon from '@mui/icons-material/Timer';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StyleIcon from '@mui/icons-material/Style'; // For Cards
import SyncIcon from '@mui/icons-material/Sync'; // For Subs
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ForumIcon from '@mui/icons-material/Forum';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CircleIcon from '@mui/icons-material/Circle';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type Player = { id: string, name: string | null };

type Match = {
  id: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  matchPeriod: string;
  homeScore: number;
  awayScore: number;
  homePenaltyScore: number;
  awayPenaltyScore: number;
  penaltySequence: any[];
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
  manOfTheMatchId?: string | null;
  homeCleanSheet: boolean;
  awayCleanSheet: boolean;
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
  const [penaltyModal, setPenaltyModal] = useState<{ matchId: string } | null>(null);
  const [tick, setTick] = useState(0);
  const router = useRouter();
  const { ask: askConfirm, modal: confirmModal } = useConfirm();

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  function getMatch(id: string) {
    return matches.find(m => m.id === id);
  }

  function updateLocal(id: string, field: string, value: any) {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  // Auto-save helpers
  async function syncMatchState(matchId: string, overrides: Partial<Match> = {}) {
    const match = getMatch(matchId);
    if (!match) return;
    const finalMatch = { ...match, ...overrides };
    
    startTransition(async () => {
      await updateMatchScore(matchId, {
        status: finalMatch.status,
        homeScore: finalMatch.homeScore,
        awayScore: finalMatch.awayScore,
        homePenaltyScore: finalMatch.homePenaltyScore,
        awayPenaltyScore: finalMatch.awayPenaltyScore,
        penaltySequence: finalMatch.penaltySequence,
        matchPeriod: finalMatch.matchPeriod,
        manOfTheMatchId: finalMatch.manOfTheMatchId ?? undefined,
        homeCleanSheet: finalMatch.homeCleanSheet,
        awayCleanSheet: finalMatch.awayCleanSheet,
      });
      router.refresh();
    });
  }

  async function syncMatchStats(matchId: string, overrides: Partial<Match> = {}) {
    const match = getMatch(matchId);
    if (!match) return;
    const finalMatch = { ...match, ...overrides };
    startTransition(async () => {
      await updateMatchStats(matchId, finalMatch);
    });
  }

  function getDisplayMinute(match: Match) {
    if (match.status === 'LIVE' && match.clockRunning && match.clockStartedAt) {
      const elapsedMs = new Date().getTime() - new Date(match.clockStartedAt).getTime();
      return match.currentMinute + Math.floor(elapsedMs / 60000);
    }
    return match.currentMinute;
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

  async function handleFinishMatch(matchId: string) {
    askConfirm(
      'Finish this match?',
      () => {
        updateLocal(matchId, 'status', 'FINISHED');
        updateLocal(matchId, 'matchPeriod', 'FINISHED');
        syncMatchState(matchId, { status: 'FINISHED', matchPeriod: 'FINISHED' });
        toast.success('Match Finished!');
      },
      { subMessage: 'Status and period will be set to FINISHED. This cannot be undone.', confirmLabel: 'Finish Match' }
    );
  }

  async function handleAddPenalty(matchId: string, data: any) {
    const match = getMatch(matchId);
    if (!match) return;
    
    const newSequence = [...(match.penaltySequence || []), { 
      id: Math.random().toString(36).substr(2, 9),
      ...data, 
      order: (match.penaltySequence?.length || 0) + 1 
    }];
    
    const homeScore = newSequence.filter(p => p.teamId === match.homeTeam.id && p.scored).length;
    const awayScore = newSequence.filter(p => p.teamId === match.awayTeam.id && p.scored).length;

    updateLocal(matchId, 'penaltySequence', newSequence);
    updateLocal(matchId, 'homePenaltyScore', homeScore);
    updateLocal(matchId, 'awayPenaltyScore', awayScore);
    
    syncMatchState(matchId, { penaltySequence: newSequence, homePenaltyScore: homeScore, awayPenaltyScore: awayScore });
    setPenaltyModal(null);
    toast.success('Penalty recorded');
  }

  async function handleDeletePenalty(matchId: string, penaltyId: string) {
    const match = getMatch(matchId);
    if (!match) return;
    
    const newSequence = (match.penaltySequence || []).filter(p => p.id !== penaltyId);
    const homeScore = newSequence.filter(p => p.teamId === match.homeTeam.id && p.scored).length;
    const awayScore = newSequence.filter(p => p.teamId === match.awayTeam.id && p.scored).length;

    updateLocal(matchId, 'penaltySequence', newSequence);
    updateLocal(matchId, 'homePenaltyScore', homeScore);
    updateLocal(matchId, 'awayPenaltyScore', awayScore);
    
    syncMatchState(matchId, { penaltySequence: newSequence, homePenaltyScore: homeScore, awayPenaltyScore: awayScore });
  }

  async function handleAddOrUpdateEvent(matchId: string, type: string, data: any, eventId?: string) {
    if (!eventId && type === 'GOAL') {
       const match = getMatch(matchId);
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
        const match = getMatch(matchId);
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
    askConfirm(
      'Delete this event?',
      () => {
        startTransition(async () => {
          const res = await deleteMatchEvent(eventId);
          if (res.success) {
            toast.success('Event deleted');
            router.refresh();
          } else toast.error(res.error);
        });
      },
      { subMessage: 'If it was a goal, the score will be reverted.', confirmLabel: 'Delete Event' }
    );
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
          const hasPenalties = match.penaltySequence && match.penaltySequence.length > 0;
          
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {match.status === 'LIVE' && (
                    <button 
                      onClick={() => handleFinishMatch(match.id)}
                      className="btn"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', background: '#10b981', color: 'white', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CheckCircleIcon sx={{ fontSize: '1rem' }} /> Finish Match
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveConsole(activeConsole === match.id ? null : match.id)}
                    className="btn glass"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
                  >
                    {activeConsole === match.id ? 'Close Console' : 'Open Event Console'}
                  </button>
                </div>
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

              {/* Penalty Shootout Tracker */}
              {(match.matchPeriod === 'PENALTIES' || hasPenalties) && (
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid var(--accent-primary)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-primary)' }}>PENALTY SHOOTOUT</div>
                      {match.status !== 'FINISHED' && (
                        <button onClick={() => setPenaltyModal({ matchId: match.id })} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.4rem 1rem' }}>+ Record Penalty</button>
                      )}
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{match.homeTeam.name.toUpperCase()} — {match.homePenaltyScore}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           {(match.penaltySequence || []).filter(p => p.teamId === match.homeTeam.id).map((p, i) => (
                             <div key={p.id} style={{ position: 'relative' }}>
                                {p.scored ? <SportsSoccerIcon sx={{ color: '#10b981' }} /> : <HighlightOffIcon sx={{ color: '#ef4444' }} />}
                                {match.status !== 'FINISHED' && (
                                  <button onClick={() => handleDeletePenalty(match.id, p.id)} style={{ position: 'absolute', top: -5, right: -5, background: 'black', border: 'none', color: 'white', borderRadius: '50%', width: '12px', height: '12px', fontSize: '8px', cursor: 'pointer' }}>x</button>
                                )}
                             </div>
                           ))}
                           {Array.from({ length: Math.max(0, 5 - (match.penaltySequence || []).filter(p => p.teamId === match.homeTeam.id).length) }).map((_, i) => (
                             <CircleIcon key={i} sx={{ color: 'rgba(255,255,255,0.05)' }} />
                           ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{match.awayTeam.name.toUpperCase()} — {match.awayPenaltyScore}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           {(match.penaltySequence || []).filter(p => p.teamId === match.awayTeam.id).map((p, i) => (
                             <div key={p.id} style={{ position: 'relative' }}>
                                {p.scored ? <SportsSoccerIcon sx={{ color: '#10b981' }} /> : <HighlightOffIcon sx={{ color: '#ef4444' }} />}
                                {match.status !== 'FINISHED' && (
                                  <button onClick={() => handleDeletePenalty(match.id, p.id)} style={{ position: 'absolute', top: -5, right: -5, background: 'black', border: 'none', color: 'white', borderRadius: '50%', width: '12px', height: '12px', fontSize: '8px', cursor: 'pointer' }}>x</button>
                                )}
                             </div>
                           ))}
                           {Array.from({ length: Math.max(0, 5 - (match.penaltySequence || []).filter(p => p.teamId === match.awayTeam.id).length) }).map((_, i) => (
                             <CircleIcon key={i} sx={{ color: 'rgba(255,255,255,0.05)' }} />
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Event Console (Expandable) */}
              {activeConsole === match.id && (
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}><TimerIcon fontSize="small" /> MATCH CLOCK</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: match.status === 'FINISHED' ? 0.5 : 1 }}>
                                <button disabled={match.status === 'FINISHED'} onClick={() => { const v = Math.max(0, match.currentMinute - 1); updateLocal(match.id, 'currentMinute', v); updateMatchClock(match.id, { running: match.clockRunning, minute: v, injuryTime: match.injuryTime, matchPeriod: match.matchPeriod }); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
                                <input disabled={match.status === 'FINISHED'} type="number" value={displayMinute} onChange={(e) => { const v = parseInt(e.target.value) || 0; updateLocal(match.id, 'currentMinute', v); updateMatchClock(match.id, { running: match.clockRunning, minute: v, injuryTime: match.injuryTime, matchPeriod: match.matchPeriod }); }} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
                                <button disabled={match.status === 'FINISHED'} onClick={() => { const v = match.currentMinute + 1; updateLocal(match.id, 'currentMinute', v); updateMatchClock(match.id, { running: match.clockRunning, minute: v, injuryTime: match.injuryTime, matchPeriod: match.matchPeriod }); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
                              </div>
                              <button disabled={match.status === 'FINISHED'} onClick={() => handleClockToggle(match)} className={`btn ${match.clockRunning ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1, opacity: match.status === 'FINISHED' ? 0.5 : 1 }}>{match.clockRunning ? 'Pause Clock' : 'Start Clock'}</button>
                            </div>
                         </div>
                         <div style={{ flex: 1 }}>
                            <CustomSelect 
                              label="Match Period"
                              disabled={match.status === 'FINISHED'} 
                              value={match.matchPeriod} 
                              onChange={(e) => { 
                                const v = e.target.value; 
                                updateLocal(match.id, 'matchPeriod', v); 
                                syncMatchState(match.id, { matchPeriod: v }); 
                              }}
                              style={{ opacity: match.status === 'FINISHED' ? 0.5 : 1 }}
                            >
                              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </CustomSelect>
                         </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>INJURY TIME (ADDITIONAL MINS)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content', opacity: match.status === 'FINISHED' ? 0.5 : 1 }}>
                          <button disabled={match.status === 'FINISHED'} onClick={() => { const v = Math.max(0, match.injuryTime - 1); updateLocal(match.id, 'injuryTime', v); updateMatchClock(match.id, { running: match.clockRunning, minute: match.currentMinute, injuryTime: v, matchPeriod: match.matchPeriod }); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
                          <input disabled={match.status === 'FINISHED'} type="number" value={match.injuryTime} onChange={(e) => { const v = parseInt(e.target.value) || 0; updateLocal(match.id, 'injuryTime', v); updateMatchClock(match.id, { running: match.clockRunning, minute: match.currentMinute, injuryTime: v, matchPeriod: match.matchPeriod }); }} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
                          <button disabled={match.status === 'FINISHED'} onClick={() => { const v = match.injuryTime + 1; updateLocal(match.id, 'injuryTime', v); updateMatchClock(match.id, { running: match.clockRunning, minute: match.currentMinute, injuryTime: v, matchPeriod: match.matchPeriod }); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
                        </div>
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

                  {/* Stats Section */}
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}><BarChartIcon fontSize="small" /> LIVE STATS (AUTO-SAVES)</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: match.status === 'FINISHED' ? 0.5 : 1 }}>
                              <button disabled={match.status === 'FINISHED'} onClick={() => { const v = Math.max(0, match.homePossession - 1); updateLocal(match.id, 'homePossession', v); updateLocal(match.id, 'awayPossession', 100 - v); syncMatchStats(match.id, { homePossession: v, awayPossession: 100 - v }); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
                              <input disabled={match.status === 'FINISHED'} type="number" value={match.homePossession} onChange={(e) => { const v = parseInt(e.target.value) || 0; updateLocal(match.id, 'homePossession', v); updateLocal(match.id, 'awayPossession', 100 - v); syncMatchStats(match.id, { homePossession: v, awayPossession: 100 - v }); }} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
                              <span>%</span>
                              <button disabled={match.status === 'FINISHED'} onClick={() => { const v = Math.min(100, match.homePossession + 1); updateLocal(match.id, 'homePossession', v); updateLocal(match.id, 'awayPossession', 100 - v); syncMatchStats(match.id, { homePossession: v, awayPossession: 100 - v }); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>POSSESSION</div>
                          <div style={{ fontWeight: '900', color: 'var(--accent-primary)' }}>{match.awayPossession}%</div>
                        </div>
                        <StatUpdateRow label="TOTAL SHOTS" homeKey="homeShots" awayKey="awayShots" match={match} updateLocal={updateLocal} onUpdate={(k: string, v: number) => syncMatchStats(match.id, { [k]: v })} />
                        <StatUpdateRow label="SHOTS ON TARGET" homeKey="homeShotsOnTarget" awayKey="awayShotsOnTarget" match={match} updateLocal={updateLocal} onUpdate={(k: string, v: number) => syncMatchStats(match.id, { [k]: v })} />
                        <StatUpdateRow label="CORNERS" homeKey="homeCorners" awayKey="awayCorners" match={match} updateLocal={updateLocal} onUpdate={(k: string, v: number) => syncMatchStats(match.id, { [k]: v })} />
                        <StatUpdateRow label="OFFSIDES" homeKey="homeOffsides" awayKey="awayOffsides" match={match} updateLocal={updateLocal} onUpdate={(k: string, v: number) => syncMatchStats(match.id, { [k]: v })} />
                     </div>
                  </div>

                  {/* ─── Events Log ─────────────────────────────── */}
                  <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '900', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <SportsSoccerIcon fontSize="small" /> Match Timeline & Events
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          {(match.events || []).length} Recorded
                        </span>
                      </div>
                    </div>
                    
                    {!match.events || match.events.length === 0 ? (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '2.5rem', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.85rem', 
                        background: 'rgba(255,255,255,0.01)', 
                        borderRadius: '12px', 
                        border: '1px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{ opacity: 0.2 }}><ForumIcon sx={{ fontSize: '2.5rem' }} /></div>
                        <p style={{ margin: 0, fontWeight: '700' }}>No events recorded for this match yet.</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>Use the "Quick Log" buttons above to start recording.</p>
                      </div>
                    ) : (
                      <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {(match.events || []).map((ev: any) => {
                          const evIcon = ev.type === 'GOAL' ? <SportsSoccerIcon sx={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} /> : 
                                         ev.type === 'YELLOW_CARD' ? <StyleIcon sx={{ fontSize: '1.2rem', color: '#fbbf24' }} /> : 
                                         ev.type === 'RED_CARD' ? <StyleIcon sx={{ fontSize: '1.2rem', color: '#ef4444' }} /> : 
                                         ev.type === 'SUBSTITUTION' ? <SyncIcon sx={{ fontSize: '1.2rem', color: '#10b981' }} /> : 
                                         ev.type === 'OWN_GOAL' ? <SentimentVeryDissatisfiedIcon sx={{ fontSize: '1.2rem', color: '#ef4444' }} /> : 
                                         ev.type === 'ASSIST' ? <DirectionsRunIcon sx={{ fontSize: '1.2rem', color: '#60a5fa' }} /> : 
                                         <AssignmentIcon sx={{ fontSize: '1.2rem', color: 'var(--text-muted)' }} />;
                          const isHome = ev.teamId === match.homeTeam.id;
                          return (
                            <div key={ev.id} className="event-row" style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '1rem', 
                              padding: '0.85rem 1rem', 
                              background: 'rgba(255,255,255,0.03)', 
                              borderRadius: '12px', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '8px', 
                                background: 'rgba(0,0,0,0.3)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                flexShrink: 0,
                                border: '1px solid rgba(255,255,255,0.05)'
                              }}>
                                {evIcon}
                              </div>
                              <div style={{ width: '40px', textAlign: 'center', flexShrink: 0 }}>
                                <div style={{ fontSize: '1rem', fontWeight: '950', color: 'var(--accent-primary)' }}>{ev.minute}'</div>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {ev.player?.name || '—'}
                                  {ev.type === 'SUBSTITUTION' && ev.playerIn?.name && (
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>↔ {ev.playerIn.name}</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                                  <span style={{ color: isHome ? 'var(--accent-primary)' : 'white', opacity: 0.8 }}>{isHome ? match.homeTeam.name : match.awayTeam.name}</span>
                                  {ev.note && <span style={{ opacity: 0.5 }}>• {ev.note}</span>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button
                                  onClick={() => setEventModal({
                                    matchId: match.id,
                                    type: ev.type,
                                    eventId: ev.id,
                                    defaultData: { teamId: ev.teamId, playerId: ev.playerId, minute: ev.minute, note: ev.note || '' }
                                  })}
                                  className="btn glass"
                                  style={{ padding: '0.4rem', minWidth: '32px', height: '32px', borderRadius: '8px' }}
                                  title="Edit event"
                                >
                                  <EditIcon sx={{ fontSize: '1rem' }} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="btn glass"
                                  style={{ padding: '0.4rem', minWidth: '32px', height: '32px', borderRadius: '8px', color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                  title="Delete event"
                                >
                                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Match Awards & Clean Sheets */}
              <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                 <div style={{ flex: 1 }}>
                  <CustomSelect 
                    label={<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><EmojiEventsIcon sx={{ fontSize: '1rem', color: '#fbbf24' }} /> Man of the Match</div>}
                    value={match.manOfTheMatchId || ''} 
                    onChange={(e) => { 
                      const v = e.target.value; 
                      updateLocal(match.id, 'manOfTheMatchId', v); 
                      syncMatchState(match.id, { manOfTheMatchId: v }); 
                    }}
                  >
                    <option value="">— Select Player —</option>
                    {match.matchSquads.map((s: any) => (
                      <option key={s.user.id} value={s.user.id}>{s.user.name} ({s.batchId === match.homeTeam.id ? 'Home' : 'Away'})</option>
                    ))}
                  </CustomSelect>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.8rem' }}>
                   <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Defensive Shutouts</div>
                   <div style={{ display: 'flex', gap: '2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={match.homeCleanSheet} 
                          onChange={(e) => { 
                            const v = e.target.checked; 
                            updateLocal(match.id, 'homeCleanSheet', v); 
                            syncMatchState(match.id, { homeCleanSheet: v }); 
                          }}
                          style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{match.homeTeam.name} Clean Sheet</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={match.awayCleanSheet} 
                          onChange={(e) => { 
                            const v = e.target.checked; 
                            updateLocal(match.id, 'awayCleanSheet', v); 
                            syncMatchState(match.id, { awayCleanSheet: v }); 
                          }}
                          style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{match.awayTeam.name} Clean Sheet</span>
                      </label>
                   </div>
                </div>
              </div>

              {/* Instant Status Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ width: '200px' }}>
                  <CustomSelect
                    value={match.status}
                    onChange={(e) => { const v = e.target.value as any; updateLocal(match.id, 'status', v); syncMatchState(match.id, { status: v }); }}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live</option>
                    <option value="FINISHED">Finished</option>
                    <option value="CANCELLED">Cancelled</option>
                  </CustomSelect>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>All changes saved instantly</div>
              </div>
            </div>
          );
        })
      )}

      {confirmModal}
      {/* Modals */}
      {eventModal && (
        <EventModal 
          isOpen={!!eventModal} 
          onClose={() => setEventModal(null)} 
          onSubmit={(data: any) => handleAddOrUpdateEvent(eventModal.matchId, eventModal.type, data, eventModal.eventId)}
          type={eventModal.type}
          match={getMatch(eventModal.matchId)!}
          defaultData={eventModal.defaultData}
          displayMinute={getDisplayMinute(getMatch(eventModal.matchId)!)}
        />
      )}

      {penaltyModal && (
        <PenaltyModal
          isOpen={!!penaltyModal}
          onClose={() => setPenaltyModal(null)}
          onSubmit={(data: any) => handleAddPenalty(penaltyModal.matchId, data)}
          match={getMatch(penaltyModal.matchId)!}
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

function StatUpdateRow({ label, homeKey, awayKey, match, updateLocal, onUpdate }: any) {
  const isFinished = match.status === 'FINISHED';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: isFinished ? 0.5 : 1 }}>
          <button disabled={isFinished} onClick={() => { const v = Math.max(0, match[homeKey] - 1); updateLocal(match.id, homeKey, v); onUpdate(homeKey, v); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
          <input disabled={isFinished} type="number" value={match[homeKey]} onChange={(e) => { const v = parseInt(e.target.value) || 0; updateLocal(match.id, homeKey, v); onUpdate(homeKey, v); }} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
          <button disabled={isFinished} onClick={() => { const v = match[homeKey] + 1; updateLocal(match.id, homeKey, v); onUpdate(homeKey, v); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: isFinished ? 0.5 : 1 }}>
          <button disabled={isFinished} onClick={() => { const v = Math.max(0, match[awayKey] - 1); updateLocal(match.id, awayKey, v); onUpdate(awayKey, v); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>-</button>
          <input disabled={isFinished} type="number" value={match[awayKey]} onChange={(e) => { const v = parseInt(e.target.value) || 0; updateLocal(match.id, awayKey, v); onUpdate(awayKey, v); }} className="score-input" style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontWeight: '800' }} />
          <button disabled={isFinished} onClick={() => { const v = match[awayKey] + 1; updateLocal(match.id, awayKey, v); onUpdate(awayKey, v); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'black', fontSize: '0.7rem' }}>+</button>
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

  // When team changes, reset player selection
  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId);
    setPlayerId('');
  };

  // Show players for selected team; fall back to all squad members if filter returns nothing
  const squadForTeam = match.matchSquads.filter((s: any) => s.batchId === teamId);
  const playerOptions = squadForTeam.length > 0 ? squadForTeam : match.matchSquads;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '2rem', margin: '0 1rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', fontWeight: '900' }}>{defaultData ? 'EDIT' : 'LOG'} {type.replace('_', ' ')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Minute</label>
            <input type="number" value={minute} onChange={(e) => setMinute(parseInt(e.target.value))} />
          </div>
          
          <CustomSelect 
            label="Team"
            value={teamId} 
            onChange={(e) => handleTeamChange(e.target.value)}
          >
            <option value={match.homeTeam.id}>{match.homeTeam.name} (Home)</option>
            <option value={match.awayTeam.id}>{match.awayTeam.name} (Away)</option>
          </CustomSelect>

          <CustomSelect 
            label={`Player ${squadForTeam.length === 0 ? '(showing all — no squad filtered for this team)' : ''}`}
            value={playerId} 
            onChange={(e) => setPlayerId(e.target.value)}
          >
            <option value="">— Select Player —</option>
            {playerOptions.map((s: any) => (
              <option key={s.user.id} value={s.user.id}>
                {s.user.name}{squadForTeam.length === 0 ? ` (${s.batchId === match.homeTeam.id ? 'Home' : 'Away'})` : ''}
              </option>
            ))}
          </CustomSelect>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Penalty, Own Goal, Header" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button onClick={onClose} className="btn glass" style={{ flex: 1 }}>Cancel</button>
            <button onClick={() => onSubmit({ teamId, playerId, minute, note })} className="btn btn-primary" style={{ flex: 1 }}>
              {defaultData ? 'Update Event' : 'Log Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PenaltyModal({ isOpen, onClose, onSubmit, match }: any) {
  const [teamId, setTeamId] = useState(match.homeTeam.id);
  const [playerId, setPlayerId] = useState('');
  const [scored, setScored] = useState(true);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', fontWeight: '900' }}>RECORD PENALTY</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <CustomSelect label="TEAM" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
            <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
          </CustomSelect>

          <CustomSelect label="PLAYER" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">Select Player</option>
            {match.matchSquads.filter((s: any) => s.batchId === teamId).map((s: any) => (
              <option key={s.user.id} value={s.user.id}>{s.user.name}</option>
            ))}
          </CustomSelect>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>RESULT</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button onClick={() => setScored(true)} className={`btn ${scored ? 'btn-primary' : 'glass'}`} style={{ flex: 1 }}>Scored</button>
               <button onClick={() => setScored(false)} className={`btn ${!scored ? 'btn-danger' : 'glass'}`} style={{ flex: 1 }}>Missed</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onClose} className="btn glass" style={{ flex: 1 }}>Cancel</button>
            <button 
              onClick={() => {
                const player = match.matchSquads.find((s: any) => s.user.id === playerId);
                onSubmit({ teamId, playerId, playerName: player?.user.name || 'Unknown', scored });
              }} 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
