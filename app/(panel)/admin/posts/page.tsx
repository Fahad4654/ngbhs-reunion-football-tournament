import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "./moderation-actions";
import MediaRenderer from "@/app/components/MediaRenderer";
import PostOptions from "@/app/components/PostOptions";

export default async function AdminPostsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN" && user?.role !== "CO_ADMIN") redirect("/");

  const posts = await prisma.post.findMany({
    include: {
      author: true,
      media: true,
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
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{post.title || 'Untitled Story'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{post.author.name}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
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
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: post.media.length > 0 ? '1.5fr 1fr' : '1fr', gap: '2rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
              </div>

              {post.media.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {post.media.map(item => (
                    <div key={item.id}>
                      <MediaRenderer 
                        url={item.url} 
                        type={item.type} 
                        style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                  ))}
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
