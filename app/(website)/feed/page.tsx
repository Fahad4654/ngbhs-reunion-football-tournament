import { getApprovedPosts } from "@/lib/actions";
import { getServerUser } from "@/lib/server-auth";
import PostActions from "./post-actions";
import MediaGallery from "@/app/components/MediaGallery";
import PostOptions from "@/app/components/PostOptions";

export const metadata = {
  title: 'Community Feed - NGBHS Reunion',
  description: 'Live updates and shared memories from the NGBHS Reunion community.',
};

export default async function FeedPage() {
  const [posts, user] = await Promise.all([
    getApprovedPosts(),
    getServerUser()
  ]);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container feed-grid">
        
        {/* Left Sidebar - Navigation/Shortcuts */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/matches" className="btn glass" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.8rem', textTransform: 'none' }}>
                <span style={{ fontSize: '1.25rem' }}>⚽</span> <span>Matches</span>
              </a>
              <a href="/standings" className="btn glass" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.8rem', textTransform: 'none' }}>
                <span style={{ fontSize: '1.25rem' }}>📊</span> <span>Standings</span>
              </a>
              <a href="/news" className="btn glass" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.8rem', textTransform: 'none' }}>
                <span style={{ fontSize: '1.25rem' }}>📰</span> <span>News</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {posts.length > 0 ? posts.map((post) => (
            <article key={post.id} className="glass" style={{ overflow: 'hidden', borderRadius: '24px' }}>
              {/* Post Header */}
              <div style={{ padding: '1.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    width: '48px', 
                    minWidth: '48px',
                    height: '48px', 
                    borderRadius: '50%', 
                    background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'black',
                    fontSize: '1.1rem',
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
                  <div style={{ minWidth: 0, width: 0, flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '800', fontSize: '1.05rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '2px' }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <PostOptions 
                  postId={post.id}
                  title={post.title}
                  content={post.content}
                  isAuthorized={user?.role === 'ADMIN' || user?.role === 'CO_ADMIN' || user?.uid === post.authorId}
                  media={post.media}
                />
              </div>

              {/* Post Content */}
              <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)', textTransform: 'none' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
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
                currentUserId={user?.uid}
                postUrl={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/feed#post-${post.id}`}
              />
            </article>
          )) : (
            <div className="glass" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏟️</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>The stadium is quiet... Be the first to post!</p>
              <a href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2rem' }}>Create First Post</a>
            </div>
          )}
        </main>

        {/* Right Sidebar - Ad/Promo */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Tournament Partner</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '200px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your Brand Here
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
