import { getApprovedPosts } from "@/lib/actions";
import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import MediaGallery from "@/app/components/MediaGallery";
import PostOptions from "@/app/components/PostOptions";
import PostActions from "@/app/(website)/feed/post-actions";
import Link from "next/link";

export const metadata = {
  title: 'My Batch Feed - NGBHS Reunion',
};

export default async function BatchFeedPage() {
  const userSession = await getServerUser();
  if (!userSession) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.uid },
    include: { batch: true }
  });

  if (!dbUser?.batchId) {
    return (
      <div style={{ maxWidth: '31.25vw', margin: '5.926vh auto' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '5.926vh 1.667vw', borderRadius: '1.25vw' }}>
          <div style={{ fontSize: '3.333vw', marginBottom: '2.222vh' }}>🎓</div>
          <h2 style={{ fontSize: '1.25vw', marginBottom: '1.481vh', color: 'var(--accent-primary)' }}>Batch Not Selected</h2>
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
      <div style={{ maxWidth: '31.25vw', margin: '5.926vh auto' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '5.926vh 1.667vw', borderRadius: '1.25vw', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ fontSize: '3.333vw', marginBottom: '2.222vh' }}>⏳</div>
          <h2 style={{ fontSize: '1.25vw', marginBottom: '1.481vh', color: '#f59e0b' }}>Approval Pending</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Your membership request for <strong style={{ color: 'white' }}>{dbUser.batch?.name}</strong> is awaiting approval by your Batch Manager.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.729vw', marginTop: '1.481vh' }}>
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
      <div style={{ maxWidth: '31.25vw', margin: '5.926vh auto' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '5.926vh 1.667vw', borderRadius: '1.25vw', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '3.333vw', marginBottom: '2.222vh' }}>❌</div>
          <h2 style={{ fontSize: '1.25vw', marginBottom: '1.481vh', color: 'var(--accent-danger)' }}>Request Rejected</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Your membership request for <strong style={{ color: 'white' }}>{dbUser.batch?.name}</strong> was not approved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.729vw', marginTop: '1.481vh' }}>
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
      <div style={{ maxWidth: 'min(100%, 600px)', width: '100%', margin: '0 auto', padding: '0 0.391vw' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25vw' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1.25vw' }}>
            {/* Post Header */}
            <div style={{ padding: '1.259vh 0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.417vw', borderBottom: '0.052vw solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625vw', minWidth: 0, flex: 1 }}>
                <div style={{ 
                  width: 'calc(1.875vw * var(--font-scale))', 
                  minWidth: 'calc(1.875vw * var(--font-scale))',
                  height: 'calc(1.875vw * var(--font-scale))', 
                  borderRadius: '50%', 
                  background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: 'black',
                  fontSize: 'calc(0.708vw * var(--font-scale))',
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
                <div style={{ minWidth: 0, width: 0, flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '800', fontSize: 'calc(0.875vw * var(--font-scale))', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'calc(0.542vw * var(--font-scale))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <PostOptions 
                postId={post.id}
                title={post.title}
                content={post.content}
                isAuthorized={userSession.role === 'ADMIN' || userSession.role === 'CO_ADMIN' || userSession.uid === post.authorId}
                media={post.media}
              />
            </div>

            {/* Post Content */}
            <div style={{ padding: '1.481vh 1.25vw 0.741vh' }}>
              <h3 style={{ fontSize: 'calc(0.917vw * var(--font-scale))', marginBottom: '0.741vh', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'calc(0.792vw * var(--font-scale))', lineHeight: '1.5', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {post.content}
              </p>
            </div>

            {/* Post Media Gallery */}
            <MediaGallery media={post.media} />

            {/* Post Actions (Client Component) */}
            <PostActions 
              postId={post.id}
              initialCheers={post.cheers}
              initialComments={post.comments}
              currentUserId={userSession.uid}
              postUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/feed#post-${post.id}`}
            />
          </article>
        )) : (
          <div className="glass" style={{ textAlign: 'center', padding: '7.407vh 1.667vw', borderRadius: '1.25vw' }}>
            <div style={{ fontSize: 'calc(2.5vw * var(--font-scale))', marginBottom: '2.222vh' }}>🏟️</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 'calc(0.917vw * var(--font-scale))', fontWeight: '600' }}>No posts in your batch yet.</p>
            <Link href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2.963vh' }}>Be the First to Post</Link>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
