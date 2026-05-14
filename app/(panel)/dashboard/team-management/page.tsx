import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeamActions from "../manage-batch/team-actions";
import RoleAssignment from "./RoleAssignment";
import DesignationAssignment from "./DesignationAssignment";
import GroupIcon from '@mui/icons-material/Group';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import UserLink from "@/app/components/UserLink";

export const metadata = {
  title: 'Team Management - Dashboard',
};

export default async function TeamManagementPage() {
  const userSession = await getServerUser();
  
  if (!userSession || userSession.role !== "BATCH_MANAGER") {
    redirect("/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.uid },
    include: { batch: true }
  });

  if (!dbUser?.batchId) {
    return (
      <div className="container" style={{ padding: '5.926vh 1.25vw', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '4.444vh 2.5vw', borderRadius: '1.25vw' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1.481vh' }}>No Batch Assigned</h2>
          <p style={{ color: 'var(--text-muted)' }}>You must be assigned to a batch to manage its team.</p>
        </div>
      </div>
    );
  }

  const members = await prisma.user.findMany({
    where: { batchId: dbUser.batchId, status: 'APPROVED' },
    include: { batch: true },
    orderBy: { name: 'asc' }
  });

  const players = members.filter(m => m.isPlayer);
  const nonPlayers = members.filter(m => !m.isPlayer);

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
          background: 'rgba(235, 183, 0, 0.1)',
          border: '1px solid var(--accent-primary)'
        }}>
          <SportsSoccerIcon sx={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem', color: 'white' }}>TEAM MANAGEMENT</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Manage {dbUser.batch?.name} squad members</p>
        </div>
      </div>

      <TeamManagementClient members={members} batchId={dbUser.batchId} />

    </div>
  );
}
