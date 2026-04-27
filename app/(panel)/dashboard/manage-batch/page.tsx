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
        gap: '0.292vw', 
        padding: '0.741vh 0.417vw', 
        borderRadius: '0.729vw', 
        marginBottom: '2.963vh', 
        width: '100%', 
        maxWidth: '31.25vw', 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Link 
          href="/dashboard/manage-batch?tab=posts"
          className="btn"
          style={{ 
            flex: '1 0 auto', 
            minWidth: '4.167vw',
            background: tab === 'posts' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'posts' ? 'black' : 'white',
            fontSize: '0.583vw',
            padding: '0.889vh 0.208vw',
            whiteSpace: 'nowrap'
          }}
        >
          📝 Posts ({pendingPosts.length})
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=members"
          className="btn"
          style={{ 
            flex: '1 0 auto', 
            minWidth: '4.167vw',
            background: tab === 'members' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'members' ? 'black' : 'white',
            fontSize: '0.583vw',
            padding: '0.889vh 0.208vw',
            whiteSpace: 'nowrap'
          }}
        >
          👥 Members ({members.length})
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=approvals"
          className="btn"
          style={{ 
            flex: '1 0 auto', 
            minWidth: '4.167vw',
            background: tab === 'approvals' ? 'var(--accent-primary)' : 'transparent',
            color: tab === 'approvals' ? 'black' : 'white',
            fontSize: '0.583vw',
            padding: '0.889vh 0.208vw',
            whiteSpace: 'nowrap'
          }}
        >
          ⏳ Pending ({pendingMembers.length})
        </Link>
      </div>

      {tab === 'posts' ? (
        <div style={{ display: 'grid', gap: '1.481vh' }}>
          {pendingPosts.length > 0 ? pendingPosts.map((post) => (
            <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1.25vw' }}>
              <div style={{ padding: '1.259vh 0.417vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.333vw', borderBottom: '0.052vw solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.417vw', minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    width: '1.875vw', 
                    minWidth: '1.875vw',
                    height: '1.875vw', 
                    borderRadius: '50%', 
                    background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'black',
                    fontSize: '0.708vw',
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
                    <div style={{ color: 'white', fontWeight: '800', fontSize: '0.875vw', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.542vw', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '2.222vh 1.25vw 0.741vh' }}>
                <h3 style={{ fontSize: '1.042vw', marginBottom: '1.111vh', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Post'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.833vw', lineHeight: '1.6', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.content}</p>
              </div>
              <MediaGallery media={post.media} />
              <div style={{ padding: '2.222vh 1.25vw', borderTop: '0.052vw solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
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
        <div className="responsive-table-container glass" style={{ borderRadius: '1.25vw' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.052vw solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.852vh 1.042vw', textAlign: 'left', fontSize: '0.667vw', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member Name</th>
                <th style={{ padding: '1.852vh 1.042vw', textAlign: 'left', fontSize: '0.667vw', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupation</th>
                <th style={{ padding: '1.852vh 1.042vw', textAlign: 'right', fontSize: '0.667vw', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? members.map((member) => (
                <tr key={member.id} style={{ borderBottom: '0.052vw solid var(--border-color)' }}>
                  <td style={{ padding: '1.852vh 1.042vw' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.833vw' }}>
                      <div style={{ width: '1.667vw', height: '1.667vw', borderRadius: '50%', background: member.role === 'BATCH_MANAGER' ? 'var(--accent-secondary)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '800', fontSize: '0.667vw' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.417vw' }}>
                          {member.name}
                          {member.role === 'BATCH_MANAGER' && (
                            <span style={{ fontSize: '0.5vw', padding: '0.148vh 0.25vw', border: '0.052vw solid var(--accent-secondary)', color: 'var(--accent-secondary)', borderRadius: '0.208vw', textTransform: 'uppercase' }}>Manager</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.625vw', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.852vh 1.042vw', color: 'var(--text-secondary)', fontSize: '0.75vw' }}>
                    {member.occupation || '---'}
                  </td>
                  <td style={{ padding: '1.852vh 1.042vw', textAlign: 'right' }}>
                    {member.id !== userSession.uid && member.role === 'USER' && (
                      <HandoverAction userId={member.id} userName={member.name || 'Member'} />
                    )}
                    {member.id === userSession.uid && (
                      <span style={{ fontSize: '0.625vw', color: 'var(--text-muted)', fontStyle: 'italic' }}>You (Current Manager)</span>
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
        <div className="responsive-table-container glass" style={{ borderRadius: '1.25vw' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.052vw solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1.852vh 1.042vw', textAlign: 'left', fontSize: '0.667vw', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Applicant</th>
                <th style={{ padding: '1.852vh 1.042vw', textAlign: 'left', fontSize: '0.667vw', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined On</th>
                <th style={{ padding: '1.852vh 1.042vw', textAlign: 'right', fontSize: '0.667vw', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.length > 0 ? pendingMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '0.052vw solid var(--border-color)' }}>
                  <td style={{ padding: '1.852vh 1.042vw' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.833vw' }}>
                      <div style={{ width: '1.667vw', height: '1.667vw', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '800', fontSize: '0.667vw' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>{member.name}</div>
                        <div style={{ fontSize: '0.625vw', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.852vh 1.042vw', color: 'var(--text-secondary)', fontSize: '0.75vw' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.852vh 1.042vw', textAlign: 'right' }}>
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
