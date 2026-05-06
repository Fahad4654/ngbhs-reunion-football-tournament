'use client';

import { useState, useEffect } from 'react';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StyleIcon from '@mui/icons-material/Style';
import SyncIcon from '@mui/icons-material/Sync';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CircleIcon from '@mui/icons-material/Circle';

const PERIODS: Record<string, string> = {
  'PRE_MATCH': 'Pre-Match',
  'FIRST_HALF': '1st Half',
  'HALF_TIME': 'Half Time',
  'SECOND_HALF': '2nd Half',
  'FULL_TIME': 'Full Time',
  'EXTRA_TIME_1': 'Extra Time 1',
  'EXTRA_TIME_HALF_TIME': 'ET Half Time',
  'EXTRA_TIME_2': 'Extra Time 2',
  'PENALTIES': 'Penalties',
  'FINISHED': 'Finished',
};

export default function MatchCenterClient({ initialMatch }: { initialMatch: any }) {
  const [match, setMatch] = useState(initialMatch);
  const [displayMinute, setDisplayMinute] = useState(match.currentMinute);

  useEffect(() => {
    const calculateMinute = () => {
      if (match.status === 'LIVE' && match.clockRunning && match.clockStartedAt) {
        const elapsedMs = new Date().getTime() - new Date(match.clockStartedAt).getTime();
        const elapsedMins = Math.floor(elapsedMs / 60000);
        setDisplayMinute(match.currentMinute + elapsedMins);
      } else {
        setDisplayMinute(match.currentMinute);
      }
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 10000);
    return () => clearInterval(interval);
  }, [match.currentMinute, match.clockRunning, match.clockStartedAt, match.status]);

  // Polling for live updates (every 5 seconds for live matches)
  useEffect(() => {
    if (match.status === 'LIVE' || match.status === 'SCHEDULED') {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/matches/${match.id}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setMatch(data);
          }
        } catch (error) {
          console.error('Failed to fetch match updates', error);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [match.id, match.status]);

  const EventIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'GOAL': return <SportsSoccerIcon sx={{ color: 'var(--accent-primary)' }} />;
      case 'YELLOW_CARD': return <StyleIcon sx={{ color: '#fbbf24' }} />;
      case 'RED_CARD': return <StyleIcon sx={{ color: '#ef4444' }} />;
      case 'SUBSTITUTION': return <SyncIcon sx={{ color: '#10b981' }} />;
      default: return <AccessTimeIcon />;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Match Header */}
      <div className="glass" style={{ padding: '3rem', borderRadius: '24px', marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
            {match.tournament?.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', marginTop: '1rem' }}>
          {/* Home Team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="glass" style={{ width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
               {match.homeTeam.logoUrl ? (
                 <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               ) : (
                 <div style={{ fontSize: '2rem', fontWeight: '900' }}>{match.homeTeam.name[0]}</div>
               )}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>{match.homeTeam.name}</h2>
          </div>

          {/* Score & Clock */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', fontWeight: '950', letterSpacing: '-0.05em', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{match.homeScore}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '2rem' }}>:</span>
              <span>{match.awayScore}</span>
            </div>
            
            {/* Penalty Score Display */}
            {match.matchPeriod === 'PENALTIES' && (
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)', marginTop: '-1rem', marginBottom: '1rem' }}>
                ({match.homePenaltyScore}) PEN ({match.awayPenaltyScore})
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {PERIODS[match.matchPeriod] || match.matchPeriod}
              </div>
              {match.status === 'LIVE' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)', padding: '0.3rem 1rem', borderRadius: '20px', fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <span className="live-dot" /> {displayMinute}' {match.injuryTime > 0 ? `+${match.injuryTime}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="glass" style={{ width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
               {match.awayTeam.logoUrl ? (
                 <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               ) : (
                 <div style={{ fontSize: '2rem', fontWeight: '900' }}>{match.awayTeam.name[0]}</div>
               )}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>{match.awayTeam.name}</h2>
          </div>
        </div>

        {/* Penalty Visual Tracker for Fans */}
        {match.matchPeriod === 'PENALTIES' && (
           <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{match.homeTeam.name.toUpperCase()}</div>
                 <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(match.penaltySequence || []).filter((p: any) => p.teamId === match.homeTeam.id).map((p: any, i: number) => (
                       p.scored ? <SportsSoccerIcon key={i} sx={{ color: '#10b981', fontSize: '1.5rem' }} /> : <HighlightOffIcon key={i} sx={{ color: '#ef4444', fontSize: '1.5rem' }} />
                    ))}
                    {Array.from({ length: Math.max(0, 5 - (match.penaltySequence || []).filter((p: any) => p.teamId === match.homeTeam.id).length) }).map((_, i) => (
                       <CircleIcon key={i} sx={{ color: 'rgba(255,255,255,0.05)', fontSize: '1.5rem' }} />
                    ))}
                 </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{match.awayTeam.name.toUpperCase()}</div>
                 <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(match.penaltySequence || []).filter((p: any) => p.teamId === match.awayTeam.id).map((p: any, i: number) => (
                       p.scored ? <SportsSoccerIcon key={i} sx={{ color: '#10b981', fontSize: '1.5rem' }} /> : <HighlightOffIcon key={i} sx={{ color: '#ef4444', fontSize: '1.5rem' }} />
                    ))}
                    {Array.from({ length: Math.max(0, 5 - (match.penaltySequence || []).filter((p: any) => p.teamId === match.awayTeam.id).length) }).map((_, i) => (
                       <CircleIcon key={i} sx={{ color: 'rgba(255,255,255,0.05)', fontSize: '1.5rem' }} />
                    ))}
                 </div>
              </div>
           </div>
        )}

        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          {new Date(match.date).toLocaleString()} • {match.venue || 'Venue TBA'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Left Column: Timeline & Lineups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Timeline */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <AccessTimeIcon color="primary" />
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Match Timeline</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
               {match.events.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No events logged yet.</div>
               ) : (
                 match.events.map((event: any, i: number) => {
                   const isHome = event.teamId === match.homeTeam.id;
                   return (
                     <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexDirection: isHome ? 'row' : 'row-reverse' }}>
                        <div style={{ width: '40px', textAlign: 'center', fontWeight: '900', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{event.minute}'</div>
                        <div className="glass" style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: isHome ? 'row' : 'row-reverse', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <EventIcon type={event.type} />
                           <div>
                              <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{event.type} — {event.player?.name}</div>
                              {event.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.note}</div>}
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
            </div>
          </div>

          {/* Lineups */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <GroupsIcon color="primary" />
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Official Lineups</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}>{match.homeTeam.name.toUpperCase()}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {match.matchSquads.filter((s: any) => s.batchId === match.homeTeam.id).map((s: any) => (
                       <div key={s.user.id} style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          {s.user.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.user.teamRole}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem' }}>{match.awayTeam.name.toUpperCase()}</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {match.matchSquads.filter((s: any) => s.batchId === match.awayTeam.id).map((s: any) => (
                       <div key={s.user.id} style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          {s.user.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.user.teamRole}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <BarChartIcon color="primary" />
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Match Stats</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <StatRow label="Possession" home={match.homePossession} away={match.awayPossession} unit="%" />
               <StatRow label="Shots" home={match.homeShots} away={match.awayShots} />
               <StatRow label="On Target" home={match.homeShotsOnTarget} away={match.awayShotsOnTarget} />
               <StatRow label="Corners" home={match.homeCorners} away={match.awayCorners} />
               <StatRow label="Offsides" home={match.homeOffsides} away={match.awayOffsides} />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .live-dot {
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          display: inline-block;
          animation: blink 1.5s infinite;
        }
        @keyframes blink {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function StatRow({ label, home, away, unit = '' }: { label: string, home: number, away: number, unit?: string }) {
  const total = (home + away) || 1;
  const homePct = (home / total) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '800' }}>
        <span>{home}{unit}</span>
        <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{label}</span>
        <span>{away}{unit}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: `${homePct}%`, background: 'var(--accent-primary)', height: '100%' }} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '100%' }} />
      </div>
    </div>
  );
}
