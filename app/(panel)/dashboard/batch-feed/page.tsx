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
      <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎓</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Batch Not Selected</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            To see your batch-specific feed, please update your profile and select your graduation batch.
          </p>
          <Link href="/profile" className="btn btn-primary">
            Update My Profile
          </Link>
        </div>
      </div>
    );
  }

  const posts = await getApprovedPosts(dbUser.batchId);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          🎓 {dbUser.batch?.name} Feed
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing posts exclusively from your batchmates.
        </p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass" style={{ overflow: 'hidden', borderRadius: '24px' }}>
            {/* Post Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                color: 'black',
                fontSize: '1rem'
              }}>
                {post.author.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{post.author.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
            <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', textTransform: 'none' }}>{post.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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
          <div className="glass" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏟️</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>No posts in your batch yet.</p>
            <Link href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2rem' }}>Be the First to Post</Link>
          </div>
        )}
      </main>
    </div>
  );
}
