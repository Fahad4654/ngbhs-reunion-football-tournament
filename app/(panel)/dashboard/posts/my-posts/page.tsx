import { getMyPosts } from "@/lib/actions";
import Link from "next/link";
import PostOptions from "@/app/components/PostOptions";

export default async function MyPostsPage() {
  const posts = await getMyPosts();

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="badge" style={{ marginBottom: '0.5rem' }}>Your Content</div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>My All Posts</h1>
        </div>
        <Link href="/dashboard/posts" className="btn btn-primary">
          ✍️ Create New
        </Link>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'white' }}>{post.title}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted on {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span className="badge" style={{ 
                  background: post.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : post.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                  color: post.status === 'APPROVED' ? '#10b981' : post.status === 'REJECTED' ? '#ef4444' : 'var(--accent-secondary)',
                  border: '1px solid currentColor'
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

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.content}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                🏆 <span style={{ color: 'white', fontWeight: '700' }}>{post._count.cheers}</span> Cheers
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                💬 <span style={{ color: 'white', fontWeight: '700' }}>{post._count.comments}</span> Comments
              </div>
              {post.status === 'APPROVED' && (
                <Link href={`/feed#post-${post.id}`} style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', marginLeft: 'auto', fontWeight: '600' }}>
                  View in Feed →
                </Link>
              )}
            </div>
          </div>
        )) : (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p>You haven't shared any stories yet.</p>
            <Link href="/dashboard/posts" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Create Your First Post</Link>
          </div>
        )}
      </div>
    </div>
  );
}
