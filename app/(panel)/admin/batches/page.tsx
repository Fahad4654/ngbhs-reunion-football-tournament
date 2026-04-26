import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminBatchesPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN") redirect("/");

  const batches = await prisma.batch.findMany({
    orderBy: [
      { points: 'desc' },
      { goalsFor: 'desc' },
    ],
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="badge" style={{ marginBottom: '0.5rem' }}>Data Management</div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Batch Standings</h1>
        </div>
        <button className="btn btn-primary">+ Register New Batch</button>
      </header>

      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.25rem' }}>Batch Name</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>P</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>W</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>D</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>L</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>GD</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>PTS</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{batch.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class of {batch.name.split(' ')[1] || 'N/A'}</div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>{batch.played}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>{batch.won}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>{batch.drawn}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>{batch.lost}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '600', color: (batch.goalsFor - batch.goalsAgainst) >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
                  {batch.goalsFor - batch.goalsAgainst > 0 ? `+${batch.goalsFor - batch.goalsAgainst}` : batch.goalsFor - batch.goalsAgainst}
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '800', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                  {batch.points}
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
