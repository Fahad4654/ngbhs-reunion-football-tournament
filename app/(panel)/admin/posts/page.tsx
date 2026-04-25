import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "./moderation-actions";

export default async function AdminPostsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const posts = await prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div className="badge" style={{ marginBottom: '0.5rem' }}>Moderation Queue</div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>User Posts Approval</h1>
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{post.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{post.author.name}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <span className="badge" style={{ 
                background: post.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : post.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                color: post.status === 'APPROVED' ? '#10b981' : post.status === 'REJECTED' ? '#ef4444' : 'var(--accent-secondary)',
                border: '1px solid currentColor'
              }}>
                {post.status}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: (post.imageUrl || post.videoUrl) ? '1.5fr 1fr' : '1fr', gap: '2rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
              </div>

              {(post.imageUrl || post.videoUrl) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                  )}
                  {post.videoUrl && (
                    <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '600' }}>
                      🎥 Video attached: <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{post.videoUrl}</a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {post.status === 'PENDING' && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <ModerationActions postId={post.id} />
              </div>
            )}
          </div>
        )) : (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
            No user posts to moderate at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
