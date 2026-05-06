'use client';

import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';

type SquadMember = {
  batch: { name: string; id: string };
  user: { name: string | null; teamRole: string | null; teamDesignation: string | null };
  status: 'STARTER' | 'SUBSTITUTE';
};

export default function PrintSquad({ 
  match, 
  squads, 
  onClose 
}: { 
  match: { homeTeam: any, awayTeam: any, date: any, venue: string | null }, 
  squads: SquadMember[],
  onClose: () => void 
}) {
  const homeSquad = squads.filter(s => s.batch.id === match.homeTeam.id);
  const awaySquad = squads.filter(s => s.batch.id === match.awayTeam.id);

  function handlePrint() {
    window.print();
  }

  const TeamSection = ({ teamName, squad }: { teamName: string, squad: SquadMember[] }) => {
    const starters = squad.filter(s => s.status === 'STARTER');
    const subs = squad.filter(s => s.status === 'SUBSTITUTE');

    return (
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h3 style={{ borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: '900' }}>
          {teamName}
        </h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Starting XI</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '0.5rem 0' }}>Player</th>
                <th style={{ padding: '0.5rem 0' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {starters.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem 0', fontWeight: '700' }}>
                    {s.user.name} 
                    {s.user.teamDesignation && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#0066cc' }}>({s.user.teamDesignation})</span>}
                  </td>
                  <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>{s.user.teamRole || 'Player'}</td>
                </tr>
              ))}
              {starters.length === 0 && <tr><td colSpan={2} style={{ padding: '1rem 0', color: '#999' }}>No starters announced</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Substitutes</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {subs.map((s, i) => (
              <li key={i} style={{ padding: '0.3rem 0', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600' }}>{s.user.name}</span>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#777' }}>— {s.user.teamRole || 'Player'}</span>
              </li>
            ))}
            {subs.length === 0 && <li style={{ color: '#999', fontSize: '0.9rem' }}>No substitutes announced</li>}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }} className="no-print-overlay">
      <style>{`
        @media print {
          .no-print-overlay { position: static !important; background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .printable-content, .printable-content * { visibility: visible; }
          .printable-content { position: absolute; left: 0; top: 0; width: 100%; color: black !important; }
        }
      `}</style>
      
      <div className="glass printable-content" style={{ 
        width: '100%', 
        maxWidth: '900px', 
        maxHeight: '90vh', 
        overflowY: 'auto', 
        background: 'white', 
        color: 'black', 
        borderRadius: '16px',
        padding: '3rem'
      }}>
        {/* Header (No-Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Print Preview</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PrintIcon /> Print Squad List
            </button>
            <button onClick={onClose} className="btn glass" style={{ color: 'black', border: '1px solid #ccc' }}>
              <CloseIcon /> Close
            </button>
          </div>
        </div>

        {/* Actual Printable Document */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Official Match Squad</h1>
          <p style={{ margin: '0.5rem 0', color: '#666', fontWeight: '600' }}>NG-BHS Reunion Football Tournament</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{match.homeTeam.name}</div>
            <div style={{ fontWeight: '400', fontSize: '0.8rem', color: '#999' }}>VS</div>
            <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{match.awayTeam.name}</div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#444' }}>
            <strong>Date:</strong> {new Date(match.date).toLocaleString()} | <strong>Venue:</strong> {match.venue || 'TBA'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
          <TeamSection teamName={match.homeTeam.name} squad={homeSquad} />
          <TeamSection teamName={match.awayTeam.name} squad={awaySquad} />
        </div>

        <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#999' }}>
          Generated on {new Date().toLocaleString()} | Official NG-BHS Tournament Management System
        </div>
      </div>
    </div>
  );
}
