import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";

export default async function AdminPostsPage() {
  const user = await getServerUser();
  
  if (user?.role !== "ADMIN") redirect("/");

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

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {posts.length > 0 && posts.map((post) => (
          <div key={post.id} className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{post.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent-secondary)', fontWeight: '700' }}>{post.author.name}</span>
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
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {post.content}
            </p>

            {post.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Approve Post</button>
                <button className="btn glass" style={{ flex: 1, color: 'var(--accent-danger)' }}>Reject Post</button>
              </div>
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No user posts to moderate at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
