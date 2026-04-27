import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "@/app/(panel)/admin/posts/moderation-actions";
import MediaGallery from "@/app/components/MediaGallery";
import Link from "next/link";
import { getPendingPosts, getPendingBatchMembers } from "@/lib/actions";
import ApprovalActions from "./approval-actions";
import PageHeader from "@/app/components/panel/PageHeader";

export const metadata = {
  title: 'Manage Batch - Dashboard',
};

export default async function ManageBatchPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams?.tab || 'posts';
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
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>No Batch Assigned</h2>
          <p style={{ color: 'var(--text-muted)' }}>You must be assigned to a batch to manage it.</p>
        </div>
      </div>
    );
  }

  const [pendingPosts, members, pendingMembers] = await Promise.all([
    getPendingPosts(),
    prisma.user.findMany({
      where: { batchId: dbUser.batchId, status: 'APPROVED' },
      orderBy: { name: 'asc' }
    }),
    getPendingBatchMembers()
  ]);

  return (
    <>
      <PageHeader 
        badge="Manager" 
        title={`Manage ${dbUser.batch?.name}`} 
      />

      {/* Tabs */}
      <div className="glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: '14px', marginBottom: '2rem', maxWidth: '400px' }}>
        <Link 
          href="/dashboard/manage-batch?tab=posts"
          className="btn"
          style={{ 
            flex: 1, 
            background: tab === 'posts' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'posts' ? 'black' : 'white',
            fontSize: '0.8rem',
            padding: '0.6rem'
          }}
        >
          📝 Pending Posts ({pendingPosts.length})
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=members"
          className="btn"
          style={{ 
            flex: 1, 
            background: tab === 'members' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'members' ? 'black' : 'white',
            fontSize: '0.8rem',
            padding: '0.6rem'
          }}
        >
          👥 Members ({members.length})
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=approvals"
          className="btn"
          style={{ 
            flex: 1, 
            background: tab === 'approvals' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'approvals' ? 'black' : 'white',
            fontSize: '0.8rem',
            padding: '0.6rem'
          }}
        >
          ⏳ Pending ({pendingMembers.length})
        </Link>
      </div>

      {tab === 'posts' ? (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {pendingPosts.length > 0 ? pendingPosts.map((post) => (
            <article key={post.id} className="glass" style={{ overflow: 'hidden', borderRadius: '24px' }}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'black' }}>
                  {post.author.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '700' }}>{post.author.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{post.title || 'Untitled Post'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{post.content}</p>
              </div>
              <MediaGallery media={post.media} />
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <ModerationActions postId={post.id} />
              </div>
            </article>
          )) : (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
              No pending posts from your batch mates.
            </div>
          )}
        </div>
      ) : tab === 'members' ? (
        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member Name</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupation</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? members.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '800', fontSize: '0.8rem' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {member.occupation || '---'}
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {member.phone || '---'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No approved members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Applicant</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined On</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.length > 0 ? pendingMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '800', fontSize: '0.8rem' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <ApprovalActions userId={member.id} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pending approval requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
