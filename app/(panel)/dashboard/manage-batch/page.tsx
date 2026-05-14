import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "@/app/(panel)/admin/posts/moderation-actions";
import MediaGallery from "@/app/components/MediaGallery";
import Link from "next/link";
import { getPendingPosts, getPendingBatchMembers } from "@/lib/actions";
import ApprovalActions from "./approval-actions";
import HandoverAction from "./handover-action";
import TeamActions from "./team-actions";
import BatchProfileForm from "./BatchProfileForm";
import UserLink from "@/app/components/UserLink";
import CollapsibleContent from "@/app/components/CollapsibleContent";
import ClickablePost from "@/app/components/ClickablePost";
import ManageBatchMembersClient from "./ManageBatchMembersClient";

import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditIcon from '@mui/icons-material/Edit';

export const metadata = {
  title: 'Manage Batch - Dashboard',
};

export const dynamic = 'force-dynamic';

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
      include: { batch: true },
      orderBy: { name: 'asc' }
    }),
    getPendingBatchMembers()
  ]);

  return (
    <>
      {/* Tabs */}
      <div className="glass no-scrollbar" style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        padding: '0.5rem', 
        borderRadius: '12px', 
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
          style={{ flex: '1', background: tab === 'posts' ? 'var(--accent-primary)' : 'transparent', color: tab === 'posts' ? 'black' : 'white', fontSize: '0.85rem', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px' }}
        >
          <DescriptionIcon sx={{ fontSize: '1.1rem' }} />
          <span>POSTS ({pendingPosts.length})</span>
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=members"
          className="btn"
          style={{ flex: '1', background: tab === 'members' ? 'var(--accent-primary)' : 'transparent', color: tab === 'members' ? 'black' : 'white', fontSize: '0.85rem', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px' }}
        >
          <GroupIcon sx={{ fontSize: '1.1rem' }} />
          <span>MEMBERS ({members.length})</span>
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=approvals"
          className="btn"
          style={{ flex: '1', background: tab === 'approvals' ? 'var(--accent-primary)' : 'transparent', color: tab === 'approvals' ? 'black' : 'white', fontSize: '0.85rem', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px' }}
        >
          <HourglassEmptyIcon sx={{ fontSize: '1.1rem' }} />
          <span>PENDING ({pendingMembers.length})</span>
        </Link>
        <Link 
          href="/dashboard/manage-batch?tab=profile"
          className="btn"
          style={{ flex: '1', background: tab === 'profile' ? 'var(--accent-primary)' : 'transparent', color: tab === 'profile' ? 'black' : 'white', fontSize: '0.85rem', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px' }}
        >
          <EditIcon sx={{ fontSize: '1.1rem' }} />
          <span>PROFILE</span>
        </Link>
      </div>

      {tab === 'posts' ? (
        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: 'min(100%, 600px)', margin: '0 auto' }}>
          {pendingPosts.length > 0 ? pendingPosts.map((post) => (
            <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1rem' }}>
              <div style={{ padding: '1rem 0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.333vw', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    width: '40px', 
                    minWidth: '40px',
                    height: '40px', 
                    borderRadius: '50%', 
                    background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'black',
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    border: post.author.image ? '1px solid var(--border-color)' : 'none',
                    flexShrink: 0
                  }}>
                    {post.author.image ? (
                      <img src={post.author.image} alt={post.author.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      post.author.name?.charAt(0)
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '800', fontSize: '1rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <ClickablePost 
                postId={post.id}
                style={{ padding: '1.5rem 1rem 0.75rem' }}
              >
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Post'}</h3>
                <CollapsibleContent htmlContent={post.content} maxHeight={250} />
              </ClickablePost>
              <MediaGallery media={post.media} />
              <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <ModerationActions postId={post.id} />
              </div>
            </article>
          )) : (
            <div className="glass" style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '1rem' }}>
              No pending posts from your batch mates.
            </div>
          )}
        </div>
      ) : tab === 'members' ? (
        <ManageBatchMembersClient 
          members={members} 
          currentUserBatchId={dbUser.batchId} 
          currentUserId={userSession.uid} 
        />

      ) : tab === 'profile' ? (
        <BatchProfileForm batch={dbUser.batch!} />
      ) : (
        <div className="responsive-table-container glass" style={{ borderRadius: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Applicant</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined On</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.length > 0 ? pendingMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '800', fontSize: '1rem' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <ApprovalActions userId={member.id} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
