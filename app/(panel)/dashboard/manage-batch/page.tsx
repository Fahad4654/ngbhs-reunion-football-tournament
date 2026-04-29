import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "@/app/(panel)/admin/posts/moderation-actions";
import MediaGallery from "@/app/components/MediaGallery";
import Link from "next/link";
import { getPendingPosts, getPendingBatchMembers } from "@/lib/actions";
import ApprovalActions from "./approval-actions";
import HandoverAction from "./handover-action";

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
      <div className="container" style={{ padding: '5.926vh 1.25vw', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '4.444vh 2.5vw', borderRadius: '1.25vw' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1.481vh' }}>No Batch Assigned</h2>
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
      {/* Tabs */}
      <div className="glass no-scrollbar" style={{ 
        display: 'flex', 
        gap: 'calc(0.4vw * var(--font-scale))', 
        padding: 'calc(0.5vh * var(--font-scale)) calc(0.4vw * var(--font-scale))', 
        borderRadius: 'calc(0.5vw * var(--font-scale))', 
        marginBottom: '2vh', 
        width: '100%', 
        maxWidth: 'min(100%, 600px)', 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <Link 
          href="/dashboard/manage-batch?tab=posts"
          className="btn"
          style={{ 
            flex: '1', 
            background: tab === 'posts' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'posts' ? 'black' : 'white',
            fontSize: 'calc(0.75vw * var(--font-scale))',
            padding: 'calc(0.8vh * var(--font-scale)) 0.5rem',
            whiteSpace: 'nowrap',
            fontWeight: '800',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          📝 POSTS ({pendingPosts.length})
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=members"
          className="btn"
          style={{ 
            flex: '1', 
            background: tab === 'members' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'members' ? 'black' : 'white',
            fontSize: 'calc(0.75vw * var(--font-scale))',
            padding: 'calc(0.8vh * var(--font-scale)) 0.5rem',
            whiteSpace: 'nowrap',
            fontWeight: '800',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          👥 MEMBERS ({members.length})
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=approvals"
          className="btn"
          style={{ 
            flex: '1', 
            background: tab === 'approvals' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'approvals' ? 'black' : 'white',
            fontSize: 'calc(0.75vw * var(--font-scale))',
            padding: 'calc(0.8vh * var(--font-scale)) 0.5rem',
            whiteSpace: 'nowrap',
            fontWeight: '800',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          ⏳ PENDING ({pendingMembers.length})
        </Link>
      </div>

      {tab === 'posts' ? (
        <div style={{ display: 'grid', gap: '1.481vh', maxWidth: 'min(100%, 600px)', margin: '0 auto' }}>
          {pendingPosts.length > 0 ? pendingPosts.map((post) => (
            <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1.25vw' }}>
              <div style={{ padding: 'calc(1.259vh * var(--font-scale)) calc(0.833vw * var(--font-scale))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.333vw', borderBottom: '0.052vw solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(0.625vw * var(--font-scale))', minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    width: 'calc(2.5vw * var(--font-scale))', 
                    minWidth: 'calc(2.5vw * var(--font-scale))',
                    height: 'calc(2.5vw * var(--font-scale))', 
                    borderRadius: '50%', 
                    background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'black',
                    fontSize: 'calc(1.1vw * var(--font-scale))',
                    overflow: 'hidden',
                    border: post.author.image ? '0.052vw solid var(--border-color)' : 'none',
                    flexShrink: 0
                  }}>
                    {post.author.image ? (
                      <img src={post.author.image} alt={post.author.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      post.author.name?.charAt(0)
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '800', fontSize: 'calc(1.1vw * var(--font-scale))', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'calc(0.7vw * var(--font-scale))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 'calc(2.222vh * var(--font-scale)) calc(1.25vw * var(--font-scale)) 0.741vh' }}>
                <h3 style={{ fontSize: 'calc(1.4vw * var(--font-scale))', marginBottom: '1.111vh', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Post'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'calc(1vw * var(--font-scale))', lineHeight: '1.6', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.content}</p>
              </div>
              <MediaGallery media={post.media} />
              <div style={{ padding: 'calc(2.222vh * var(--font-scale)) calc(1.25vw * var(--font-scale))', borderTop: '0.052vw solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <ModerationActions postId={post.id} />
              </div>
            </article>
          )) : (
            <div className="glass" style={{ padding: '5.926vh 1.667vw', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '1.25vw' }}>
              No pending posts from your batch mates.
            </div>
          )}
        </div>
      ) : tab === 'members' ? (
        <div className="responsive-table-container glass" style={{ borderRadius: '1.25vw', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '0.052vw solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'left', fontSize: 'calc(0.85vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member Name</th>
                <th style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'left', fontSize: 'calc(0.85vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupation</th>
                <th style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'right', fontSize: 'calc(0.85vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? members.map((member) => (
                <tr key={member.id} style={{ borderBottom: '0.052vw solid var(--border-color)' }}>
                  <td style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(0.833vw * var(--font-scale))' }}>
                      <div style={{ 
                        width: 'calc(3vw * var(--font-scale))', 
                        height: 'calc(3vw * var(--font-scale))', 
                        borderRadius: '50%', 
                        background: member.role === 'BATCH_MANAGER' ? 'var(--accent-secondary)' : 'var(--accent-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'black', 
                        fontWeight: '800', 
                        fontSize: 'calc(1.2vw * var(--font-scale))' 
                      }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: 'calc(0.417vw * var(--font-scale))', fontSize: 'calc(1.2vw * var(--font-scale))' }}>
                          {member.name}
                          {member.role === 'BATCH_MANAGER' && (
                            <span style={{ fontSize: 'calc(0.6vw * var(--font-scale))', padding: '0.2vh 0.4vw', border: '0.052vw solid var(--accent-secondary)', color: 'var(--accent-secondary)', borderRadius: '0.208vw', textTransform: 'uppercase' }}>Manager</span>
                          )}
                        </div>
                        <div style={{ fontSize: 'calc(0.9vw * var(--font-scale))', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', color: 'var(--text-secondary)', fontSize: 'calc(1.1vw * var(--font-scale))' }}>
                    {member.occupation || '---'}
                  </td>
                  <td style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'right' }}>
                    {member.id !== userSession.uid && member.role === 'USER' && (
                      <HandoverAction userId={member.id} userName={member.name || 'Member'} />
                    )}
                    {member.id === userSession.uid && (
                      <span style={{ fontSize: 'calc(1vw * var(--font-scale))', color: 'var(--text-muted)', fontStyle: 'italic' }}>You (Current Manager)</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '5.926vh 1.667vw', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No approved members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="responsive-table-container glass" style={{ borderRadius: '1.25vw', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '0.052vw solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'left', fontSize: 'calc(0.85vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Applicant</th>
                <th style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'left', fontSize: 'calc(0.85vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined On</th>
                <th style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'right', fontSize: 'calc(0.85vw * var(--font-scale))', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.length > 0 ? pendingMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '0.052vw solid var(--border-color)' }}>
                  <td style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(0.833vw * var(--font-scale))' }}>
                      <div style={{ 
                        width: 'calc(3vw * var(--font-scale))', 
                        height: 'calc(3vw * var(--font-scale))', 
                        borderRadius: '50%', 
                        background: 'var(--accent-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'black', 
                        fontWeight: '800', 
                        fontSize: 'calc(1.2vw * var(--font-scale))' 
                      }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', fontSize: 'calc(1.2vw * var(--font-scale))' }}>{member.name}</div>
                        <div style={{ fontSize: 'calc(0.9vw * var(--font-scale))', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', color: 'var(--text-secondary)', fontSize: 'calc(1.1vw * var(--font-scale))' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'calc(1.852vh * var(--font-scale)) calc(1.042vw * var(--font-scale))', textAlign: 'right' }}>
                    <ApprovalActions userId={member.id} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '5.926vh 1.667vw', textAlign: 'center', color: 'var(--text-muted)' }}>
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
