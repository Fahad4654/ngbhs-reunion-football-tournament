import { getApprovedPosts } from "@/lib/actions";
import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import MediaGallery from "@/app/components/MediaGallery";
import PostOptions from "@/app/components/PostOptions";
import PostActions from "@/app/(website)/feed/post-actions";
import Link from "next/link";
import SchoolIcon from '@mui/icons-material/School';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import StadiumIcon from '@mui/icons-material/Stadium';
import UserLink from "@/app/components/UserLink";
import CollapsibleContent from "@/app/components/CollapsibleContent";
import ClickablePost from "@/app/components/ClickablePost";

export const metadata = {
  title: 'My Batch Feed - NGBHS Reunion',
};

export const dynamic = 'force-dynamic';

export default async function BatchFeedPage() {
  const userSession = await getServerUser();
  if (!userSession) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.uid },
    include: { batch: true }
  });

  if (!dbUser?.batchId) {
    return (
      <div style={{ maxWidth: 'min(100%, 500px)', width: '100%', margin: '5.926vh auto', padding: '0 1rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '5.926vh 1.667vw', borderRadius: '1.25vw' }}>
          <div style={{ marginBottom: '2.222vh' }}>
            <SchoolIcon sx={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: 'var(--accent-primary)' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.5rem)', marginBottom: '1.481vh', color: 'var(--accent-primary)' }}>Batch Not Selected</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.963vh', lineHeight: '1.6' }}>
            To see your batch-specific feed, please update your profile and select your graduation batch.
          </p>
          <Link href="/profile" className="btn btn-primary">
            Update My Profile
          </Link>
        </div>
      </div>
    );
  }

  // Gate: pending or rejected users cannot see batch activity
  if (userSession.status === 'PENDING') {
    return (
      <div style={{ maxWidth: 'min(100%, 500px)', width: '100%', margin: '5.926vh auto', padding: '0 1rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '5.926vh 1.667vw', borderRadius: '1.25vw', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ marginBottom: '2.222vh' }}>
            <HourglassEmptyIcon sx={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#f59e0b' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.5rem)', marginBottom: '1.481vh', color: '#f59e0b' }}>Approval Pending</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Your membership request for <strong style={{ color: 'white' }}>{dbUser.batch?.name}</strong> is awaiting approval by your Batch Manager.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.481vh' }}>
            You'll gain access to the batch feed and be able to post once your request is approved.
          </p>
          <Link href="/feed" className="btn glass" style={{ marginTop: '2.963vh' }}>
            Browse Global Feed
          </Link>
        </div>
      </div>
    );
  }

  if (userSession.status === 'REJECTED') {
    return (
      <div style={{ maxWidth: 'min(100%, 500px)', width: '100%', margin: '5.926vh auto', padding: '0 1rem' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '5.926vh 1.667vw', borderRadius: '1.25vw', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ marginBottom: '2.222vh' }}>
            <CancelIcon sx={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: 'var(--accent-danger)' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.5rem)', marginBottom: '1.481vh', color: 'var(--accent-danger)' }}>Request Rejected</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Your membership request for <strong style={{ color: 'white' }}>{dbUser.batch?.name}</strong> was not approved.
          </p>
          {(dbUser as any).statusReason && (
            <div className="glass" style={{ 
              padding: '1rem', 
              borderRadius: '12px', 
              background: 'rgba(239, 68, 68, 0.05)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Reason from Manager:</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{(dbUser as any).statusReason}"</div>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Please contact your Batch Manager or update your batch selection in your profile.
          </p>
          <div style={{ display: 'flex', gap: '0.833vw', justifyContent: 'center', marginTop: '2.963vh', flexWrap: 'wrap' }}>
            <Link href="/profile" className="btn btn-primary">Update Profile</Link>
            <Link href="/feed" className="btn glass">Global Feed</Link>
          </div>
        </div>
      </div>
    );
  }

  const posts = await getApprovedPosts(dbUser.batchId);

  return (
    <>
      <div style={{ maxWidth: 'min(100%, 600px)', width: '100%', margin: '0 auto', padding: '0 0.5rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1rem' }}>
            {/* Post Header */}
            <div style={{ padding: '1rem 0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(90deg, rgba(235, 183, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 200px' }}>
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
                    <div style={{ color: 'white', fontWeight: '800', fontSize: '1rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <UserLink user={post.author} currentUserBatchId={dbUser.batchId!} />
                    </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                <PostOptions 
                  postId={post.id}
                  title={post.title}
                  content={post.content}
                  isAuthorized={userSession.role === 'ADMIN' || userSession.role === 'CO_ADMIN' || userSession.uid === post.authorId}
                  media={post.media}
                />
              </div>
            </div>

            <ClickablePost 
              postId={post.id}
              style={{ padding: '1.25rem 1rem 0.75rem' }}
            >
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Story'}</h3>
              <CollapsibleContent htmlContent={post.content} maxHeight={250} />
            </ClickablePost>

            {/* Post Media Gallery */}
            <MediaGallery media={post.media} />

            {/* Post Actions (Client Component) */}
            <PostActions 
              postId={post.id}
              initialCheers={post.cheers}
              initialComments={post.comments}
              currentUserId={userSession.uid}
              postUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/dashboard/batch-feed#post-${post.id}`}
            />
          </article>
        )) : (
          <div className="glass" style={{ textAlign: 'center', padding: '5rem 1.667vw', borderRadius: '1.25vw' }}>
            <div style={{ marginBottom: '2.222vh' }}>
              <StadiumIcon sx={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>No posts in your batch yet.</p>
            <Link href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2.963vh' }}>Be the First to Post</Link>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
