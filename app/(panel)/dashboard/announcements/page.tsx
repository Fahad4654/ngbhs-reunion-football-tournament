import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MatchAnnouncementsClient from "./MatchAnnouncementsClient";
import CampaignIcon from '@mui/icons-material/Campaign';

export const metadata = {
  title: 'Match Announcements - Dashboard',
};

export default async function MatchAnnouncementsPage() {
  const userSession = await getServerUser();
  
  if (!userSession || userSession.role !== "BATCH_MANAGER") {
    redirect("/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.uid },
    include: { batch: true }
  });

  if (!dbUser?.batchId) {
    redirect("/dashboard");
  }

  const upcomingMatches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeamId: dbUser.batchId },
        { awayTeamId: dbUser.batchId }
      ],
      date: { gte: new Date() }
    },
    include: {
      homeTeam: { select: { id: true, name: true, logoUrl: true } },
      awayTeam: { select: { id: true, name: true, logoUrl: true } },
      tournament: { select: { name: true } },
      squadMembers: {
        where: { batchId: dbUser.batchId },
        include: { user: { select: { id: true, name: true, image: true, teamRole: true, teamDesignation: true } } }
      }
    },
    orderBy: { date: 'asc' }
  });

  const squadMembers = await prisma.user.findMany({
    where: { batchId: dbUser.batchId, isPlayer: true, status: 'APPROVED' },
    select: { id: true, name: true, image: true, teamRole: true, teamDesignation: true }
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
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #38bdf8'
        }}>
          <CampaignIcon sx={{ color: '#38bdf8', fontSize: '1.5rem' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem', color: 'white' }}>MATCH ANNOUNCEMENTS</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Announce your squad for upcoming games</p>
        </div>
      </div>

      <MatchAnnouncementsClient 
        batchId={dbUser.batchId} 
        matches={upcomingMatches} 
        allPlayers={squadMembers} 
      />
    </div>
  );
}
