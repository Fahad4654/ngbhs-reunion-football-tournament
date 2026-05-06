'use client';

import CloseIcon from '@mui/icons-material/Close';

interface Player {
  id: string;
  name: string;
  image: string | null;
  teamRole: string | null;
  teamDesignation: string | null;
}

interface SquadModalProps {
  teamName: string;
  players: Player[];
  onClose: () => void;
}

export default function SquadModal({ teamName, players, onClose }: SquadModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '550px',
        maxHeight: '85vh',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(15, 17, 20, 0.95)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'white' }}>Team Squad</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>{teamName}</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon sx={{ fontSize: '1.3rem' }} />
          </button>
        </div>

        {/* Players List */}
        <div className="no-scrollbar" style={{ 
          padding: '1.5rem', 
          overflowY: 'auto',
          flex: 1
        }}>
          {players.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {players.map((player) => (
                <div 
                  key={player.id} 
                  className="glass" 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    background: player.image ? 'transparent' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'black',
                    fontSize: '1rem',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {player.image ? (
                      <img src={player.image} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      player.name.charAt(0)
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ color: 'white', fontWeight: '700', fontSize: '1.05rem' }}>{player.name}</div>
                      {player.teamDesignation && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          padding: '0.15rem 0.5rem', 
                          background: 'rgba(56, 189, 248, 0.1)', 
                          color: '#38bdf8', 
                          border: '1px solid rgba(56, 189, 248, 0.3)', 
                          borderRadius: '4px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em'
                        }}>
                          {player.teamDesignation}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>
                      {player.teamRole || 'Player'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p>No squad information available for this team yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', background: 'rgba(10, 11, 13, 0.4)' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {players.length} registered players for {teamName}
          </p>
        </div>
      </div>
    </div>
  );
}
