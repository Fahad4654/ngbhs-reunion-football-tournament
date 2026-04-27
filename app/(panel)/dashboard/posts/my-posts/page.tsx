import { getMyPosts } from "@/lib/actions";
import Link from "next/link";
import PostOptions from "@/app/components/PostOptions";
import MediaGallery from "@/app/components/MediaGallery";
import { getServerUser } from "@/lib/server-auth";

export default async function MyPostsPage() {
  const [posts, user] = await Promise.all([
    getMyPosts(),
    getServerUser()
  ]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.222vh' }}>
        <Link href="/dashboard/posts" className="btn btn-primary">
          ✍️ Create New Story
        </Link>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gap: '0.833vw' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass panel-card" style={{ overflow: 'hidden', borderRadius: '1.25vw' }}>
            {/* Post Header */}
            <div style={{ padding: '1.259vh 0.417vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.333vw', borderBottom: '0.052vw solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.417vw', minWidth: 0, flex: 1 }}>
                <div style={{ 
                  width: '1.875vw', 
                  minWidth: '1.875vw',
                  height: '1.875vw', 
                  borderRadius: '50%', 
                  background: user?.image ? 'transparent' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: 'black',
                  fontSize: '0.708vw',
                  overflow: 'hidden',
                  border: user?.image ? '0.052vw solid var(--border-color)' : 'none',
                  flexShrink: 0
                }}>
                  {user?.image ? (
                    <img src={user.image} alt={user.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '0.875vw', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.542vw', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.185vh' }}>
                    Submitted {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.333vw', alignItems: 'center', flexShrink: 0 }}>
                <span className="badge" style={{ 
                  padding: '0.296vh 0.333vw',
                  fontSize: '0.458vw',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  background: post.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : post.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                  color: post.status === 'APPROVED' ? '#10b981' : post.status === 'REJECTED' ? '#ef4444' : 'var(--accent-secondary)',
                  border: '0.052vw solid currentColor',
                  borderRadius: '0.208vw'
                }}>
                  {post.status}
                </span>
                <PostOptions 
                  postId={post.id}
                  title={post.title}
                  content={post.content}
                  isAuthorized={true}
                  media={post.media}
                />
              </div>
            </div>

            {/* Post Content */}
            <div style={{ padding: '1.481vh 0.417vw 0.741vh' }}>
              <h3 style={{ fontSize: '0.917vw', marginBottom: '0.741vh', color: 'var(--accent-primary)', textTransform: 'none', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.title || 'Untitled Story'}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.792vw', lineHeight: '1.5', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {post.content}
              </p>
            </div>

            {/* Media Gallery */}
            <MediaGallery media={post.media} />

            {/* Footer Stats */}
            <div style={{ display: 'flex', gap: '1.25vw', borderTop: '0.052vw solid var(--border-color)', padding: '1.111vh 0.417vw', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.833vw' }}>
                <div style={{ fontSize: '0.667vw', color: 'var(--text-muted)' }}>
                  🏆 <span style={{ color: 'white', fontWeight: '700' }}>{post._count.cheers}</span> Cheers
                </div>
                <div style={{ fontSize: '0.667vw', color: 'var(--text-muted)' }}>
                  💬 <span style={{ color: 'white', fontWeight: '700' }}>{post._count.comments}</span> Comments
                </div>
              </div>
              {post.status === 'APPROVED' && (
                <Link href={`/feed#post-${post.id}`} style={{ fontSize: '0.667vw', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  View on Feed →
                </Link>
              )}
            </div>
          </article>
        )) : (
          <div className="glass" style={{ padding: '7.407vh 0.833vw', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '1.25vw' }}>
            <div style={{ fontSize: '2.5vw', marginBottom: '2.222vh' }}>📝</div>
            <h3 style={{ color: 'white', marginBottom: '0.741vh' }}>No stories shared yet</h3>
            <p>Your approved posts will appear here and in the community feed.</p>
            <Link href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '2.963vh' }}>Create Your First Post</Link>
          </div>
        )}
      </div>
    </>
  );
}
