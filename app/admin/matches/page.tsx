import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminMatchesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const matches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="badge" style={{ marginBottom: '0.5rem' }}>Management</div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Tournament Matches</h1>
        </div>
        <button className="btn btn-primary">+ Create New Match</button>
      </header>

      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.25rem' }}>Date & Time</th>
              <th style={{ padding: '1.25rem' }}>Match Details</th>
              <th style={{ padding: '1.25rem' }}>Score</th>
              <th style={{ padding: '1.25rem' }}>Status</th>
              <th style={{ padding: '1.25rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '600' }}>{new Date(match.date).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(match.date).toLocaleTimeString()}</div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: '700' }}>{match.homeTeam.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>vs</span>
                    <span style={{ fontWeight: '700' }}>{match.awayTeam.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{match.venue || 'Main Stadium'}</div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '6px', 
                    display: 'inline-block',
                    fontFamily: 'monospace',
                    fontWeight: '800',
                    fontSize: '1.1rem'
                  }}>
                    {match.homeScore} - {match.awayScore}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span className={`badge ${match.status === 'LIVE' ? 'badge-live' : ''}`} style={{ 
                    background: match.status === 'FINISHED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: match.status === 'FINISHED' ? '#10b981' : 'var(--text-secondary)',
                    border: '1px solid currentColor'
                  }}>
                    {match.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Edit</button>
                    <button className="btn glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--accent-danger)' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
