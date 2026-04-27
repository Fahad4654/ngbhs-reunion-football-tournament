import { getServerUser } from "@/lib/server-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModerationActions from "./moderation-actions";
import MediaGallery from "@/app/components/MediaGallery";
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
    <>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {posts.length > 0 ? posts.map((post) => (
          <article key={post.id} className="glass" style={{ overflow: 'hidden', borderRadius: '24px' }}>
            {/* Post Header */}
            {/* Post Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)' }} className="mobile-stack">
              <div style={{ 
                width: '44px', 
                minWidth: '44px',
                height: '44px', 
                borderRadius: '50%', 
                background: post.author.image ? 'transparent' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                color: 'black',
                fontSize: '1rem',
                overflow: 'hidden',
                border: post.author.image ? '1px solid var(--border-color)' : 'none'
              }}>
                {post.author.image ? (
                  <img src={post.author.image} alt={post.author.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  post.author.name?.charAt(0)
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

            {/* Post Content */}
            <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', textTransform: 'none' }}>{post.title || 'Untitled Story'}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>
            </div>

            {/* Post Media Gallery */}
            <MediaGallery media={post.media} />

            {/* Moderation Actions */}
            {post.status === 'PENDING' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <ModerationActions postId={post.id} />
              </div>
            )}
          </article>
        )) : (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
            No user posts to moderate at the moment.
          </div>
        )}
      </div>
    </>
  );
}
