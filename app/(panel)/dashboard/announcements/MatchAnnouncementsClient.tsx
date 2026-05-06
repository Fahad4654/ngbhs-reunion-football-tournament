'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMatchSquad, getFullMatchSquads } from '@/lib/actions/match-squad.actions';
import { toast } from 'react-hot-toast';
import PrintSquad from '@/app/components/PrintSquad';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

type Player = {
  id: string;
  name: string | null;
  image: string | null;
  teamRole: string | null;
  teamDesignation: string | null;
};

type Match = {
  id: string;
  date: any;
  homeTeam: { id: string; name: string; logoUrl: string | null };
  awayTeam: { id: string; name: string; logoUrl: string | null };
  tournament: { name: string } | null;
  squadMembers: { userId: string; status: 'STARTER' | 'SUBSTITUTE' }[];
};

export default function MatchAnnouncementsClient({ batchId, matches, allPlayers }: { batchId: string, matches: any[], allPlayers: Player[] }) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [squad, setSquad] = useState<{ userId: string, status: 'STARTER' | 'SUBSTITUTE' }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [printingMatch, setPrintingMatch] = useState<{ match: any, squads: any[] } | null>(null);
  const router = useRouter();

  function openModal(match: Match) {
    setSelectedMatch(match);
    setSquad(match.squadMembers.map(m => ({ userId: m.userId, status: m.status })));
  }

  function togglePlayer(userId: string) {
    setSquad(prev => {
      const exists = prev.find(p => p.userId === userId);
      if (exists) {
        return prev.filter(p => p.userId !== userId);
      } else {
        return [...prev, { userId, status: 'STARTER' }];
      }
    });
  }

  function updateStatus(userId: string, status: 'STARTER' | 'SUBSTITUTE') {
    setSquad(prev => prev.map(p => p.userId === userId ? { ...p, status } : p));
  }

  function handleSave() {
    if (!selectedMatch) return;
    startTransition(async () => {
      try {
        const res = await updateMatchSquad(selectedMatch.id, batchId, squad);
        if (res.success) {
          toast.success('Match squad announced successfully!');
          setSelectedMatch(null);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to update squad');
        }
      } catch (err: any) {
        console.error('Action error:', err);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  }

  async function handlePrint(match: any) {
    if (match.squadMembers.length === 0) {
      toast.error('No squad announced for this match yet.');
      return;
    }
    const squads = await getFullMatchSquads(match.id);
    setPrintingMatch({ match, squads });
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {matches.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No upcoming matches found for your team.</p>
        </div>
      ) : (
        matches.map(match => (
          <div key={match.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '80px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>
                  {new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ textAlign: 'right', flex: 1, fontWeight: '700' }}>{match.homeTeam.name}</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>VS</div>
                <div style={{ textAlign: 'left', flex: 1, fontWeight: '700' }}>{match.awayTeam.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {match.squadMembers.length > 0 ? `${match.squadMembers.length} Players Announced` : 'No Squad Announced Yet'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '800' }}>{match.tournament?.name}</div>
              </div>
              <button 
                className="btn glass" 
                onClick={() => handlePrint(match)}
                title="Print Squad List"
                style={{ padding: '0.6rem' }}
              >
                <PrintIcon sx={{ fontSize: '1.2rem' }} />
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => openModal(match)}
                style={{ padding: '0.6rem 1.2rem' }}
              >
                {match.squadMembers.length > 0 ? 'Edit Squad' : 'Announce Squad'}
              </button>
            </div>
          </div>
        ))
      )}

      {selectedMatch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedMatch(null)} />
          <div className="glass" style={{ position: 'relative', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem' }}>Announce Squad</h3>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                </p>
              </div>
              <button onClick={() => setSelectedMatch(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38bdf8' }}>{squad.filter(p => p.status === 'STARTER').length}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Starters</div>
              </div>
              <div style={{ background: 'rgba(235, 183, 0, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(235, 183, 0, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{squad.filter(p => p.status === 'SUBSTITUTE').length}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Substitutes</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Select Squad Members</h4>
              {allPlayers.map(player => {
                const selection = squad.find(s => s.userId === player.id);
                const isSelected = !!selection;
                
                return (
                  <div key={player.id} className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent', background: isSelected ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => togglePlayer(player.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>
                        {player.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{player.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{player.teamRole || 'Player'}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
                        <button 
                          onClick={() => updateStatus(player.id, 'STARTER')}
                          style={{ 
                            padding: '0.35rem 0.75rem', 
                            fontSize: '0.65rem', 
                            fontWeight: '800', 
                            borderRadius: '6px', 
                            border: 'none', 
                            cursor: 'pointer',
                            background: selection.status === 'STARTER' ? '#38bdf8' : 'transparent',
                            color: selection.status === 'STARTER' ? 'black' : 'white'
                          }}
                        >
                          STARTER
                        </button>
                        <button 
                          onClick={() => updateStatus(player.id, 'SUBSTITUTE')}
                          style={{ 
                            padding: '0.35rem 0.75rem', 
                            fontSize: '0.65rem', 
                            fontWeight: '800', 
                            borderRadius: '6px', 
                            border: 'none', 
                            cursor: 'pointer',
                            background: selection.status === 'SUBSTITUTE' ? 'var(--accent-primary)' : 'transparent',
                            color: selection.status === 'SUBSTITUTE' ? 'black' : 'white'
                          }}
                        >
                          SUB
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
              <button 
                className="btn glass" 
                onClick={() => setSelectedMatch(null)}
                style={{ flex: 1, padding: '1rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={isPending}
                style={{ flex: 2, padding: '1rem' }}
              >
                {isPending ? 'Announcing...' : 'Confirm Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {printingMatch && (
        <PrintSquad 
          match={printingMatch.match} 
          squads={printingMatch.squads} 
          onClose={() => setPrintingMatch(null)} 
        />
      )}
    </div>
  );
}
