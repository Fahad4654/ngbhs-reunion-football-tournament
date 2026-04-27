import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ManagerScoresPage() {
  const user = await getServerUser();
  
  if (user?.role !== "CO_ADMIN" && user?.role !== "ADMIN") redirect("/");

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ['LIVE', 'SCHEDULED'] }
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  return (
    <>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {matches.map((match) => (
          <div key={match.id} className="glass" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {new Date(match.date).toLocaleDateString()} • {match.venue}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>{match.homeTeam.name}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="number" defaultValue={match.homeScore} style={{ width: '50px', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center', fontSize: '1.25rem', fontWeight: '800' }} />
                  <span style={{ fontWeight: '800' }}>-</span>
                  <input type="number" defaultValue={match.awayScore} style={{ width: '50px', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center', fontSize: '1.25rem', fontWeight: '800' }} />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>{match.awayTeam.name}</div>
                </div>
              </div>
            </div>
            <div style={{ marginLeft: '4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Update</button>
              <button className="btn glass" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>Set to Live</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
