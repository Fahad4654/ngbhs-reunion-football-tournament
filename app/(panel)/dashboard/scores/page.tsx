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

      <div className="responsive-grid" style={{ display: 'grid', gap: '1.25vw' }}>
        {matches.map((match) => (
          <div key={match.id} className="glass mobile-stack" style={{ padding: '1.852vh 1.667vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.667vw' }}>
            <div style={{ flex: 1, width: '100%' }}>
               <div style={{ fontSize: '0.667vw', color: 'var(--text-muted)', marginBottom: '1.481vh' }} className="mobile-text-center">
                {new Date(match.date).toLocaleDateString()} • {match.venue}
              </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25vw' }} className="mobile-stack">
                <div style={{ textAlign: 'right', flex: 1 }} className="mobile-text-center">
                   <div style={{ fontWeight: '800', fontSize: '0.917vw' }}>{match.homeTeam.name}</div>
                </div>
                   <div style={{ display: 'flex', gap: '0.417vw', alignItems: 'center', justifyContent: 'center' }}>
                  <input type="number" defaultValue={match.homeScore} style={{ width: '2.604vw', padding: '0.463vh 0.417vw', borderRadius: '0.417vw', background: 'var(--bg-primary)', border: '0.052vw solid var(--border-color)', color: 'white', textAlign: 'center', fontSize: '1.042vw', fontWeight: '800' }} />
                  <span style={{ fontWeight: '800' }}>-</span>
                  <input type="number" defaultValue={match.awayScore} style={{ width: '2.604vw', padding: '0.463vh 0.417vw', borderRadius: '0.417vw', background: 'var(--bg-primary)', border: '0.052vw solid var(--border-color)', color: 'white', textAlign: 'center', fontSize: '1.042vw', fontWeight: '800' }} />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }} className="mobile-text-center">
                   <div style={{ fontWeight: '800', fontSize: '0.917vw' }}>{match.awayTeam.name}</div>
                </div>
              </div>
            </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.741vh' }} className="mobile-stack">
              <button className="btn btn-primary" style={{ padding: '0.556vh 1vw' }}>Update</button>
              <button className="btn glass" style={{ padding: '0.556vh 1vw', fontSize: '0.625vw' }}>Set to Live</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
