import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UpdateScoreClient from "./UpdateScoreClient";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

export const metadata = {
  title: 'Update Scores - Dashboard',
};

export default async function UpdateScorePage() {
  const user = await getServerUser();
  
  const allowedRoles = ["ADMIN", "CO_ADMIN", "SCORER"];
  if (!user || !allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  // Fetch matches that are active (LIVE) or upcoming (SCHEDULED) or recently finished
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { status: 'LIVE' },
        { status: 'SCHEDULED' },
        { 
          status: 'FINISHED',
          updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Recently finished (last 24h)
        }
      ]
    },
    include: {
      homeTeam: { select: { id: true, name: true, logoUrl: true } },
      awayTeam: { select: { id: true, name: true, logoUrl: true } },
      tournament: { select: { name: true } },
      matchSquads: {
        include: { 
          user: { select: { id: true, name: true, teamRole: true, teamDesignation: true } } 
        }
      }
    },
    orderBy: [
      { status: 'asc' }, // LIVE usually comes first alphabetically? No, we should probably sort manually
      { date: 'asc' }
    ]
  });

  // Sort matches so LIVE is first
  const sortedMatches = matches.sort((a, b) => {
    if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
    if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
    return 0;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444'
        }}>
          <SportsSoccerIcon sx={{ color: '#ef4444', fontSize: '1.5rem' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem', color: 'white' }}>UPDATE SCORES</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Manage live match results and statuses</p>
        </div>
      </div>

      <UpdateScoreClient initialMatches={JSON.parse(JSON.stringify(sortedMatches))} />
    </div>
  );
}
