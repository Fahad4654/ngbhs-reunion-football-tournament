import { getApprovedPosts } from "@/lib/actions";
import { getServerUser } from "@/lib/server-auth";
import PostActions from "./post-actions";

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
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 600px 1fr', gap: '2rem', alignItems: 'start' }}>
        
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
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>⋯</button>
              </div>

              {/* Post Content */}
              <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', textTransform: 'none' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
              </div>

              {/* Post Media */}
              {post.imageUrl && (
                <div style={{ width: '100%', padding: '1rem 1.5rem' }}>
                  <img src={post.imageUrl} alt={post.title} style={{ width: '100%', borderRadius: '16px', display: 'block', border: '1px solid var(--border-color)' }} />
                </div>
              )}

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

        {/* Right Sidebar - Info */}
        <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Featured Match</h3>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                  <span style={{ fontWeight: '800' }}>VS</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
                <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: '700', textAlign: 'center' }}>Batch 2010 vs Batch 2012</p>
                <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem', fontWeight: '700' }}>Tomorrow, 4:00 PM</p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
