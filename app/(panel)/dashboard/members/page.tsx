import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MemberDirectory from "./MemberDirectory";
import GroupIcon from '@mui/icons-material/Group';

export const metadata = {
  title: 'Member Directory - Dashboard',
};

export default async function MembersPage() {
  const userSession = await getServerUser();
  
  if (!userSession || !["USER", "BATCH_MANAGER"].includes(userSession.role)) {
    redirect("/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.uid },
    include: { batch: true }
  });

  if (!dbUser?.batchId) {
    redirect("/profile");
  }

  const members = await prisma.user.findMany({
    where: { 
      status: 'APPROVED',
      batchId: dbUser.batchId 
    },
    include: { batch: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <GroupIcon sx={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem', color: 'white' }}>BATCH MEMBERS</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Members of {dbUser.batch?.name}</p>
        </div>
      </div>

      <MemberDirectory members={members} currentUserBatchId={dbUser.batchId} />
    </div>
  );
}
