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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Squad List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-primary)', margin: 0 }}>SQUAD LIST ({players.length})</h3>
          </div>
          <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            {players.length > 0 ? players.map((player) => (
              <div key={player.id} style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>
                      {player.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserLink user={player} currentUserBatchId={dbUser.batchId} />
                        {player.teamRole && (
                          <span style={{ 
                            fontSize: '0.6rem', 
                            padding: '0.1rem 0.4rem', 
                            background: 'rgba(235, 183, 0, 0.1)', 
                            color: 'var(--accent-primary)', 
                            border: '1px solid rgba(235, 183, 0, 0.3)', 
                            borderRadius: '4px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                          }}>
                            {player.teamRole}
                          </span>
                        )}
                        {player.teamDesignation && (
                          <span style={{ 
                            fontSize: '0.6rem', 
                            padding: '0.1rem 0.4rem', 
                            background: 'rgba(56, 189, 248, 0.1)', 
                            color: '#38bdf8', 
                            border: '1px solid rgba(56, 189, 248, 0.3)', 
                            borderRadius: '4px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                          }}>
                            {player.teamDesignation}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{player.occupation || 'Player'}</div>
                    </div>
                  </div>
                  <TeamActions userId={player.id} isPlayer={true} userName={player.name || 'Player'} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <RoleAssignment userId={player.id} currentRole={player.teamRole} userName={player.name || 'Player'} />
                  <DesignationAssignment userId={player.id} currentDesignation={player.teamDesignation} userName={player.name || 'Player'} />
                </div>
              </div>
            )) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No players added to the squad yet.
              </div>
            )}
          </div>
        </section>

        {/* Available Members */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-secondary)', margin: 0 }}>AVAILABLE MEMBERS</h3>
          </div>
          <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            {nonPlayers.length > 0 ? nonPlayers.map((member) => (
              <div key={member.id} style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                      {member.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserLink user={member} currentUserBatchId={dbUser.batchId} />
                        {member.teamRole && (
                          <span style={{ 
                            fontSize: '0.6rem', 
                            padding: '0.1rem 0.4rem', 
                            background: 'rgba(255,255,255,0.05)', 
                            color: 'var(--text-secondary)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '4px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                          }}>
                            {member.teamRole}
                          </span>
                        )}
                        {member.teamDesignation && (
                          <span style={{ 
                            fontSize: '0.6rem', 
                            padding: '0.1rem 0.4rem', 
                            background: 'rgba(56, 189, 248, 0.1)', 
                            color: '#38bdf8', 
                            border: '1px solid rgba(56, 189, 248, 0.3)', 
                            borderRadius: '4px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                          }}>
                            {member.teamDesignation}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.occupation || 'Member'}</div>
                    </div>
                  </div>
                  <TeamActions userId={member.id} isPlayer={false} userName={member.name || 'Member'} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <RoleAssignment userId={member.id} currentRole={member.teamRole} userName={member.name || 'Member'} />
                  <DesignationAssignment userId={member.id} currentDesignation={member.teamDesignation} userName={member.name || 'Member'} />
                </div>
              </div>
            )) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No other members found in your batch.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
